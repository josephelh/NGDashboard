import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { RefreshResponse } from '../models/auth.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  let authReq = req;

  // Clone the request and add the Authorization header if a token exists
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // --- UPGRADE: Add error handling to catch 401s ---
  return next(authReq).pipe(
    catchError((error: any) => {
      // Check if the error is a 401 Unauthorized error
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // This is a token expiration error, so try to refresh the token
        return handle401Error(req, next);
      }

      // For all other errors, just re-throw the error
      return throwError(() => error);
    })
  );
};

// --- NEW: Helper function to handle the refresh logic ---
const handle401Error = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  return authService.refreshToken().pipe(
    switchMap((refreshResponse: RefreshResponse) => {
      const newAuthReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${refreshResponse.accessToken}`,
        },
      });
      return next(newAuthReq);
    }),
    catchError((refreshError) => {
      authService.logout();
      return throwError(() => refreshError);
    })
  );
};
