import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/product-page/product-page').then((m) => m.ProductPage),
  },
  // '/products' owns the auth check via authGuard — an unauthenticated visit
  // here still ends up at /login (with a returnUrl back to /products), it
  // just goes through the guard instead of an unconditional redirect.
  { path: '', redirectTo: 'products', pathMatch: 'full' },
];
