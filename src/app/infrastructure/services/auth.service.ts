import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError, switchMap, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly PERMISSIONS_KEY = 'userPermissions';

  permissions = signal<string[]>([]);
  userAvatar = signal<string | null>(null);
  currentUser = signal<any>(null);

  constructor() {
    const savedPermissions = localStorage.getItem(this.PERMISSIONS_KEY);
    if (savedPermissions) {
      this.permissions.set(JSON.parse(savedPermissions));
    }

    // Si ya hay token al iniciar (recarga de página), programar renovación
    const token = this.getAccessToken();
    if (token) {
      const remaining = this.getTokenRemainingSeconds(token);
      if (remaining > 0) {
        this.scheduleTokenRefresh(remaining);
        
        // Cargar inmediatamente del localStorage el perfil guardado para evitar delay
        const userId = this.getUserId();
        if (userId) {
          const cachedUser = localStorage.getItem(`current_user_profile_${userId}`);
          if (cachedUser) {
            this.currentUser.set(JSON.parse(cachedUser));
          }
          this.loadStoredAvatar();
        }
        
        this.loadUserProfile();
      } else {
        this.logout();
      }
    }
  }

  loadUserPermissions(): void {
    const userId = this.getUserId();
    if (!userId) return;
    this.apiService.get<any>(`/usuarios/${userId}/permisos`).subscribe({
      next: (res: any) => {
        // La respuesta viene agrupada por módulo: { productos: [{nombre, tiene_permiso},...], ... }
        const data: Record<string, any[]> = res?.data || res || {};
        const activos: string[] = [];
        Object.values(data).forEach((lista: any[]) => {
          if (!Array.isArray(lista)) return;
          lista.forEach((p: any) => {
            if (p?.tiene_permiso && p?.nombre) activos.push(p.nombre as string);
          });
        });
        this.permissions.set(activos);
        localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(activos));
      },
      error: () => this.permissions.set([])
    });
  }

  hasPermission(permission: string): boolean {
    // Los administradores tienen acceso total siempre
    const role = this.getUserRole()?.toUpperCase();
    if (role === 'ADMINISTRADOR' || role === 'SUPER ADMINISTRADOR') return true;
    return this.permissions().includes(permission);
  }

  isSuperAdmin(): boolean {
    return this.getUserRole()?.toUpperCase() === 'SUPER ADMINISTRADOR';
  }

  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    this.clearRefreshTimer();
  }

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', { correo, contrasena }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
          this.scheduleTokenRefresh(res.data.expiresIn);
          this.loadUserProfile();
        }
      }),
      switchMap(res => {
        const userId = this.getUserId();
        if (!userId) {
          return of(res);
        }
        // Cargar los permisos del usuario y esperar a que se resuelva antes de retornar el LoginResponse original
        return this.apiService.get<any>(`/usuarios/${userId}/permisos`).pipe(
          tap((permRes: any) => {
            const data: Record<string, any[]> = permRes?.data || permRes || {};
            const activos: string[] = [];
            Object.values(data).forEach((lista: any[]) => {
              if (!Array.isArray(lista)) return;
              lista.forEach((p: any) => {
                if (p?.tiene_permiso && p?.nombre) activos.push(p.nombre as string);
              });
            });
            this.permissions.set(activos);
            localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(activos));
          }),
          switchMap(() => of(res)),
          catchError(() => {
            this.permissions.set([]);
            return of(res); // Aún así permitimos loguear pero sin permisos adicionales
          })
        );
      })
    );
  }

  refreshTokenRequest(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<LoginResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
          this.scheduleTokenRefresh(res.data.expiresIn);
        }
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const userId = this.getUserId();
    this.clearRefreshTimer();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    if (userId) {
      localStorage.removeItem(`current_user_profile_${userId}`);
    }
    this.permissions.set([]);
    this.userAvatar.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
        return decoded.roles[0];
      }
      return decoded.rol || decoded.role || null;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded.sub || null;
    } catch {
      return null;
    }
  }

  // Devuelve los segundos restantes del token (0 si ya expiró o es inválido)
  private getTokenRemainingSeconds(token: string): number {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (!decoded.exp) return 0;
      return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    } catch {
      return 0;
    }
  }

  // Programa el refresh 60 segundos antes de que expire el token
  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimer();
    const delayMs = Math.max(0, (expiresIn - 60) * 1000);
    this.refreshTimerId = setTimeout(() => {
      this.refreshTokenRequest().subscribe({
        error: () => {}
      });
    }, delayMs);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  loadStoredAvatar(): void {
    const userId = this.getUserId();
    if (userId) {
      this.userAvatar.set(localStorage.getItem(`user_avatar_${userId}`));
    } else {
      this.userAvatar.set(null);
    }
  }

  loadUserProfile(): void {
    const userId = this.getUserId();
    if (userId) {
      this.loadStoredAvatar();
      
      this.apiService.get<any>(`/usuarios/${userId}`).subscribe({
        next: (res: any) => {
          const user = res?.data || res;
          this.currentUser.set(user);
          localStorage.setItem(`current_user_profile_${userId}`, JSON.stringify(user));
        },
        error: () => {
          // Si falla y no hay nada cargado, lo limpiamos, de lo contrario dejamos la cache
          if (!this.currentUser()) {
            this.currentUser.set(null);
          }
        }
      });
    } else {
      this.currentUser.set(null);
    }
  }

  updateAvatar(base64: string | null): void {
    const userId = this.getUserId();
    if (userId) {
      if (base64) {
        localStorage.setItem(`user_avatar_${userId}`, base64);
      } else {
        localStorage.removeItem(`user_avatar_${userId}`);
      }
      this.userAvatar.set(base64);
    }
  }
}
