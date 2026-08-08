import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthStore } from './auth.store';

// Never attach a (possibly stale) access token to the endpoints that issue tokens —
// doing so on /auth/refresh in particular would risk a retry loop.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.includes(path));

  const accessToken = authStore.accessToken();
  const authReq =
    accessToken && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return authStore.refresh().pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            return throwError(() => error);
          }
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${authStore.accessToken()}` },
          });
          return next(retryReq);
        }),
      );
    }),
  );
};
