import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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
  private readonly TOKEN_KEY = 'access_token';

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', { correo, contrasena }).pipe(
      tap(res => {
        if (res?.data?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, res.data.accessToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
