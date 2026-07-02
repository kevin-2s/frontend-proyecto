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

    const role = this.getUserRole()?.toUpperCase();
    const isSedeAdmin = role === 'ADMINISTRADOR';
    const isSuperAdmin = role === 'SUPER ADMINISTRADOR';

    if (!isSedeAdmin && !isSuperAdmin) {
      // Los roles no-admin no necesitan permisos dinámicos del backend.
      // Retornamos vacío para evitar el 403.
      this.permissions.set([]);
      return;
    }

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
    const role = this.authServiceRole()?.toUpperCase();
    if (!role) return false;

    // Los administradores tienen acceso total siempre
    if (role === 'ADMINISTRADOR' || role === 'SUPER ADMINISTRADOR') return true;

    // Permisos implícitos por rol (mapeo estático para evitar llamadas a la API que dan 403)
    if (role === 'RESPONSABLE DE BODEGA') {
      const implicit = ['ver_productos', 'ver_inventario', 'ver_solicitudes', 'ver_traslados', 'ver_reportes', 'ver_dashboard'];
      if (implicit.includes(permission)) return true;
    }

    if (role === 'INSTRUCTOR') {
      const implicit = ['ver_fichas', 'ver_productos', 'ver_solicitudes', 'ver_inventario', 'ver_traslados', 'ver_reportes', 'ver_dashboard'];
      if (implicit.includes(permission)) return true;
    }

    if (role === 'APRENDIZ') {
      const implicit = ['ver_productos', 'ver_solicitudes', 'ver_dashboard'];
      if (implicit.includes(permission)) return true;
    }

    return this.permissions().includes(permission);
  }

  // Helper interno para evitar circularidad
  private authServiceRole(): string | null {
    return this.getUserRole();
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

          // Guardamos el correo que usó para iniciar sesión — el JWT no lo incluye
          // pero sí lo tenemos del formulario de login
          localStorage.setItem('login_correo', correo);

          // ── Paso 1: inicializar perfil desde el JWT + correo del formulario ────
          const userId = this.getUserId();
          if (userId) {
            this.loadProfileFromToken(userId, correo);
          }

          // ── Paso 2: Si el backend devuelve datos del usuario en el login ────────
          const loginData: any = res.data;
          const userFromLogin = loginData.usuario || loginData.user || loginData.perfil || null;
          if (userFromLogin && userId) {
            this.currentUser.set(userFromLogin);
            localStorage.setItem(`current_user_profile_${userId}`, JSON.stringify(userFromLogin));
          }

          // ── Paso 3: Para admins, cargar perfil completo desde la API ──────────
          this.loadUserProfile();
        }
      }),
      switchMap(res => {
        const userId = this.getUserId();
        if (!userId) {
          return of(res);
        }

        const role = this.getUserRole()?.toUpperCase() || '';
        const isSedeAdmin = role === 'ADMINISTRADOR';
        const isSuperAdmin = role === 'SUPER ADMINISTRADOR';

        // Solo llamamos al endpoint de permisos para roles administrativos
        if (!isSedeAdmin && !isSuperAdmin) {
          this.permissions.set([]);
          localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify([]));
          return of(res);
        }

        return this.apiService.get<any>(`/usuarios/${userId}/permisos`).pipe(
          tap((permRes: any) => {
            // ── Extraer permisos activos ──────────────────────────────────────
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

            // ── Intentar extraer datos del usuario de la respuesta ────────────
            const usuarioDePermisos =
              permRes?.usuario ||
              permRes?.user ||
              permRes?.data?.usuario ||
              permRes?.data?.user ||
              null;

            if (usuarioDePermisos && userId) {
              const currentProfile = this.currentUser() || {};
              const loginCorreo = localStorage.getItem('login_correo') || '';
              const merged = {
                ...currentProfile,
                nombre: usuarioDePermisos.nombre || currentProfile.nombre,
                apellidos: usuarioDePermisos.apellidos || currentProfile.apellidos || '',
                documento: usuarioDePermisos.documento || usuarioDePermisos.numero_documento || currentProfile.documento || '',
                telefono: usuarioDePermisos.telefono || currentProfile.telefono || '',
                correo: usuarioDePermisos.correo || currentProfile.correo || loginCorreo,
                tenant_id: usuarioDePermisos.tenant_id || currentProfile.tenant_id,
              };
              this.currentUser.set(merged);
              localStorage.setItem(`current_user_profile_${userId}`, JSON.stringify(merged));
            }
          }),
          switchMap(() => of(res)),
          catchError(() => {
            this.permissions.set([]);
            return of(res);
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

  isAdmin(): boolean {
    return this.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
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
    if (!userId) {
      this.currentUser.set(null);
      return;
    }

    this.loadStoredAvatar();

    // Consultar el perfil actual directamente de la API para todos los roles (con fallback a cache)
    this.apiService.get<any>(`/usuarios/${userId}`).subscribe({
      next: (res: any) => {
        const user = res?.data || res;
        this.currentUser.set(user);
        localStorage.setItem(`current_user_profile_${userId}`, JSON.stringify(user));
      },
      error: () => {
        // Fallback: caché o token JWT
        const cached = localStorage.getItem(`current_user_profile_${userId}`);
        if (cached) {
          try {
            const cachedUser = JSON.parse(cached);
            this.currentUser.set(cachedUser);
            return;
          } catch {}
        }
        this.loadProfileFromToken(userId);
      }
    });
  }

  private loadProfileFromToken(userId: number, correoFromForm?: string): void {
    let decodedUser: any = null;
    try {
      const token = this.getAccessToken();
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));

        // ── El correo puede venir del formulario de login o del JWT ───────────
        // El JWT del backend SOLO tiene: sub, roles, tenantId (sin datos personales)
        const correoGuardado = correoFromForm
          || localStorage.getItem('login_correo')
          || decoded.correo || decoded.email || decoded.mail || '';

        const correo = correoGuardado;

        // Si no hay nombre en el JWT, lo derivamos del correo (parte antes del @)
        const nombreDelCorreo = correo.split('@')[0]
          ?.replace(/[._]/g, ' ')
          ?.replace(/\b\w/g, (c: string) => c.toUpperCase())
          || 'Usuario';

        const nombre =
          decoded.nombre || decoded.name || decoded.firstName ||
          decoded.first_name || decoded.username || nombreDelCorreo;

        const apellidos =
          decoded.apellidos || decoded.apellido || decoded.lastName ||
          decoded.last_name || decoded.surname || '';

        const documento =
          decoded.documento || decoded.numero_documento || decoded.cedula ||
          decoded.dni || decoded.identification || '';

        const telefono =
          decoded.telefono || decoded.phone || decoded.phoneNumber ||
          decoded.celular || '';

        const tenantId =
          decoded.tenantId || decoded.tenant_id || decoded.sede_id || null;

        const rolNombre =
          decoded.rolNombre || decoded.rol_nombre ||
          (Array.isArray(decoded.roles) ? decoded.roles[0] : null) ||
          decoded.rol || decoded.role || '';

        decodedUser = {
          id_usuario: decoded.id_usuario || decoded.id || Number(decoded.sub) || userId,
          nombre,
          apellidos,
          documento,
          telefono,
          correo,
          id_rol: decoded.id_rol || (Array.isArray(decoded.roles) ? decoded.roles[0] : null) || decoded.rol || decoded.role || null,
          rolNombre,
          tenant_id: tenantId,
          estado: decoded.estado !== undefined ? decoded.estado : true,
          id_ficha: decoded.id_ficha || decoded.ficha_id || null,
          ficha_numero: decoded.ficha_numero || null,
        };
      }
    } catch (e) {
      console.error('[Auth] Error decodificando token:', e);
    }

    // Enriquecer con caché del localStorage si tiene datos más completos
    // (ej: nombre/apellidos guardados de una sesión anterior como admin)
    const cached = localStorage.getItem(`current_user_profile_${userId}`);
    if (cached) {
      try {
        const cachedUser = JSON.parse(cached);
        decodedUser = {
          ...decodedUser,
          // Prioridad al caché para datos personales (pueden venir de cuando el admin los vio)
          nombre: (cachedUser.nombre && cachedUser.nombre !== 'Usuario') ? cachedUser.nombre : decodedUser?.nombre,
          apellidos: cachedUser.apellidos || decodedUser?.apellidos || '',
          documento: cachedUser.documento || decodedUser?.documento || '',
          telefono: cachedUser.telefono || decodedUser?.telefono || '',
          correo: cachedUser.correo || decodedUser?.correo,
          tenant_id: cachedUser.tenant_id || decodedUser?.tenant_id,
          id_rol: cachedUser.id_rol || decodedUser?.id_rol,
          rolNombre: cachedUser.rolNombre || cachedUser.rol?.nombre || decodedUser?.rolNombre || '',
          ficha: cachedUser.ficha || null,
          id_ficha: cachedUser.id_ficha || null,
          ficha_numero: cachedUser.ficha_numero || null,
        };
      } catch {}
    }

    if (decodedUser) {
      this.currentUser.set(decodedUser);
      localStorage.setItem(`current_user_profile_${userId}`, JSON.stringify(decodedUser));
    } else if (!this.currentUser()) {
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
