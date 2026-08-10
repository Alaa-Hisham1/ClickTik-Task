import { Injectable } from '@angular/core';

import { AuthUser } from './interfaces/auth';

const ACCESS_TOKEN_KEY = 'clicktik.auth.accessToken';
const REFRESH_TOKEN_KEY = 'clicktik.auth.refreshToken';
const USER_KEY = 'clicktik.auth.user';

// Single place that touches Web Storage for auth. We use our own tokens via
// the Authorization header (see auth-interceptor.ts), not the cookies
// DummyJSON sets on login — so HTTP calls never pass withCredentials, and
// this class is the one and only thing allowed to call localStorage directly.
// localStorage (not sessionStorage) so a page reload/new tab doesn't drop
// the session — consistent with the guard reading through AuthStore, which
// hydrates its signals from here once at startup.
@Injectable({
  providedIn: 'root',
})
export class AuthStorage {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  // Persisted alongside the tokens so a page reload can rehydrate more than
  // just "is there a valid token" — CartStore, for one, needs the user's id
  // and would otherwise silently have nothing to send until the next login.
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  hasSession(): boolean {
    return this.getAccessToken() !== null;
  }
}
