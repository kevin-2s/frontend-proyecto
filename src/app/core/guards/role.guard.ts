import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../infrastructure/services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.getUserRole()?.toUpperCase();

    if (userRole && allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
};
