import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthStore } from './auth.store';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  function setup(isAuthenticated: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: { isAuthenticated: () => isAuthenticated } },
      ],
    });
  }

  it('allows navigation when authenticated', () => {
    setup(true);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/products' } as RouterStateSnapshot,
    );

    expect(result).toBe(true);
  });

  it('redirects to /login with a returnUrl when not authenticated', () => {
    setup(false);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/products' } as RouterStateSnapshot,
    );

    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe(
      '/login?returnUrl=%2Fproducts',
    );
  });
});
