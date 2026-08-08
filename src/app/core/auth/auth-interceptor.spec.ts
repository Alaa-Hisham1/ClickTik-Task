import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { AuthStore } from './auth.store';

interface FakeAuthStore {
  accessToken: () => string | null;
  refresh: () => Observable<boolean>;
}

describe('authInterceptor', () => {
  function run(req: HttpRequest<unknown>, next: HttpHandlerFn, fakeAuthStore: FakeAuthStore) {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: fakeAuthStore }],
    });
    return TestBed.runInInjectionContext(() => authInterceptor(req, next));
  }

  it('attaches the access token for a regular request', async () => {
    const req = new HttpRequest('GET', '/products');
    let authHeader: string | null = null;
    const next: HttpHandlerFn = (forwarded) => {
      authHeader = forwarded.headers.get('Authorization');
      return of();
    };

    await firstValueFrom(
      run(req, next, { accessToken: () => 'token-123', refresh: () => of(true) }),
      { defaultValue: undefined },
    );

    expect(authHeader).toBe('Bearer token-123');
  });

  it('does not attach a token to the login endpoint', async () => {
    const req = new HttpRequest('POST', '/auth/login', {});
    let hasAuthHeader = true;
    const next: HttpHandlerFn = (forwarded) => {
      hasAuthHeader = forwarded.headers.has('Authorization');
      return of();
    };

    await firstValueFrom(
      run(req, next, { accessToken: () => 'token-123', refresh: () => of(true) }),
      { defaultValue: undefined },
    );

    expect(hasAuthHeader).toBe(false);
  });

  it('refreshes and retries once on a 401 from a protected request', async () => {
    const req = new HttpRequest('GET', '/products');
    let attempt = 0;
    let retryAuthHeader: string | null = null;
    const next: HttpHandlerFn = (forwarded) => {
      attempt++;
      if (attempt === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      retryAuthHeader = forwarded.headers.get('Authorization');
      return of();
    };

    let token = 'old-token';
    const fakeAuthStore: FakeAuthStore = {
      accessToken: () => token,
      refresh: () => {
        token = 'new-token';
        return of(true);
      },
    };

    await firstValueFrom(run(req, next, fakeAuthStore), { defaultValue: undefined });

    expect(attempt).toBe(2);
    expect(retryAuthHeader).toBe('Bearer new-token');
  });

  it('propagates the original error when refresh fails', async () => {
    const req = new HttpRequest('GET', '/products');
    const originalError = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = () => throwError(() => originalError);

    await expect(
      firstValueFrom(
        run(req, next, { accessToken: () => 'old-token', refresh: () => of(false) }),
      ),
    ).rejects.toBe(originalError);
  });
});
