import { Injectable, inject } from '@angular/core';
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
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', { correo, contrasena }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
          if (res.data.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, res.data.refreshToken);
          }
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
    
    // We send refresh token to an endpoint, assuming it might be /auth/refresh
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
      return decoded.rol || decoded.role || null; // Assume 'rol' or 'role' is in payload
    } catch (e) {
      return null;
    }
  }
}
