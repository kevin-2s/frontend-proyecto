import { Injectable, inject, signal } from '@angular/core';
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
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly PERMISSIONS_KEY = 'userPermissions';

  permissions = signal<string[]>([]);

  constructor() {
    const savedPermissions = localStorage.getItem(this.PERMISSIONS_KEY);
    if (savedPermissions) {
      this.permissions.set(JSON.parse(savedPermissions));
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
    if (this.getUserRole()?.toUpperCase() === 'ADMINISTRADOR') return true;
    return this.permissions().includes(permission);
  }

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', { correo, contrasena }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
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
    
    // Enviamos el token de actualización al endpoint, asumiendo que podría ser /auth/refresh
    return this.apiService.post<LoginResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
        }
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    this.permissions.set([]);
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
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  }
}
