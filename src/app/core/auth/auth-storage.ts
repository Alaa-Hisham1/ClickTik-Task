import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'clicktik.auth.accessToken';
const REFRESH_TOKEN_KEY = 'clicktik.auth.refreshToken';

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

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasSession(): boolean {
    return this.getAccessToken() !== null;
  }
}
