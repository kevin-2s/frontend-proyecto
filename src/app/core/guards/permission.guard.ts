import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../infrastructure/services/auth.service';

/**
 * Guard dinámico basado en permisos granulares.
 * Uso en rutas:  canActivate: [permissionGuard('ver_centros')]
 */
export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(requiredPermission)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
};
