import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
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

  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Si ya hay token al iniciar (recarga de página), programar renovación
    const token = this.getAccessToken();
    if (token) {
      const remaining = this.getTokenRemainingSeconds(token);
      if (remaining > 0) {
        this.scheduleTokenRefresh(remaining);
      } else {
        this.logout();
      }
    }
  }

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
        }
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
    this.clearRefreshTimer();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
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
}
