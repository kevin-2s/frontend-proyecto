import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../infrastructure/services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Demasiadas peticiones: cerrar sesión por seguridad
      if (error.status === 429) {
        notificationService.warn(
          'Demasiadas peticiones detectadas. Tu sesión fue cerrada por seguridad.',
          'Seguridad',
          { life: 5000 }
        );
        setTimeout(() => authService.logout(), 1500);
        return throwError(() => error);
      }

      const isUnauthorized =
        error.status === 401 ||
        (error.status === 400 && error.error?.error === 'UnauthorizedException');

      if (isUnauthorized && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        return authService.refreshTokenRequest().pipe(
          switchMap((res) => {
            const newToken = res.data.accessToken;
            const clonedReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(clonedReq);
          }),
          catchError((refreshErr) => {
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
