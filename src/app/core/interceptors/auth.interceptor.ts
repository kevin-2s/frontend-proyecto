import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../infrastructure/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401 || (error.status === 400 && error.error?.error === 'UnauthorizedException');
      if (isUnauthorized && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return authService.refreshTokenRequest().pipe(
          switchMap((res) => {
            // Reintentar la petición original con el nuevo token
            const newToken = res.data.accessToken;
            const clonedReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(clonedReq);
          }),
          catchError((refreshErr) => {
            // Si el refresh también falla, el authService ya hizo el logout() y redirigió
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
