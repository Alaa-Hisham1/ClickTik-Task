import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, Observable, catchError, map, of, pipe, switchMap, tap } from 'rxjs';

import { AuthStorage } from './auth-storage';
import { AuthService } from './auth.service';
import { AuthSession, AuthState, AuthUser, LoginRequest } from './interfaces/auth';



const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ accessToken, status }) => ({
    isAuthenticated: computed(() => !!accessToken()),
    loading: computed(() => status() === 'loading'),
  })),
  withMethods(
    (store, authService = inject(AuthService), authStorage = inject(AuthStorage)) => ({
      // Driven by the login form's submit — switchMap cancels a stale in-flight
      // attempt if the user resubmits, and catchError sits on the inner
      // (per-request) pipe so a failed login doesn't kill the outer method stream.
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { status: 'loading', error: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tap((session: AuthSession) => {
                const { accessToken, refreshToken, ...user } = session;
                authStorage.setAccessToken(accessToken);
                authStorage.setRefreshToken(refreshToken);
                patchState(store, {
                  user,
                  accessToken,
                  refreshToken,
                  status: 'idle',
                  error: null,
                });
              }),
              catchError((error: unknown) => {
                const message =
                  error instanceof HttpErrorResponse && error.status === 400
                    ? 'Invalid username or password.'
                    : 'Something went wrong. Please try again.';
                patchState(store, { status: 'error', error: message });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      // Plain method (not rxMethod) — called imperatively by the HTTP interceptor
      // on a 401, which needs the pass/fail result to decide whether to retry.
      refresh(): Observable<boolean> {
        const refreshToken = store.refreshToken();
        if (!refreshToken) {
          return of(false);
        }
        return authService.refresh(refreshToken).pipe(
          map((session) => {
            authStorage.setAccessToken(session.accessToken);
            authStorage.setRefreshToken(session.refreshToken);
            patchState(store, {
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
            });
            return true;
          }),
          catchError(() => {
            // Refresh token is invalid/expired — the session is over, so drop
            // it the same way a successful logout would, without exposing a
            // separate logout() method nothing in the app calls.
            authStorage.clearSession();
            patchState(store, initialState);
            return of(false);
          }),
        );
      },
    }),
  ),
  // One-time hydration from storage when the store is first constructed, so a
  // page reload doesn't drop a still-valid session and bounce the guard to /login.
  withHooks({
    onInit(store) {
      const authStorage = inject(AuthStorage);
      const accessToken = authStorage.getAccessToken();
      const refreshToken = authStorage.getRefreshToken();
      if (accessToken && refreshToken) {
        patchState(store, { accessToken, refreshToken });
      }
    },
  }),
);
