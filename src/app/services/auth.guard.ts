import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check the authentication state from the service's signal
  if (authService.isLoggedIn()) {
    return true; // The user is authenticated, allow access.
  } else {
    // The user is not authenticated, redirect to the login page.
    router.navigate(['/login']);
    return false; // Block access to the requested route.
  }
};
