import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, concatMap, tap } from 'rxjs';

import { AuthStore } from '../../core/auth/auth.store';
import { CartService } from './cart.service';
import { CartProductLine } from './interfaces/cart';

interface CartState {
  items: CartProductLine[];
  count: number;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: CartState = {
  items: [],
  count: 0,
  status: 'idle',
  error: null,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, cartService = inject(CartService), authStore = inject(AuthStore)) => ({
    // DummyJSON's /carts/add doesn't persist anything server-side — each
    // call has to resend the *whole* accumulated line-item list to get an
    // accurate total back. concatMap (not switchMap) deliberately: adding
    // product B must never cancel — and silently drop — the still-in-flight
    // request for product A. Each add is processed in order, one at a time.
    addToCart: rxMethod<number>(
      concatMap((productId) => {
        const userId = authStore.user()?.id;
        if (!userId) {
          patchState(store, { status: 'error', error: 'You need to be signed in to add items to the cart.' });
          return EMPTY;
        }

        const items = store.items();
        const existing = items.find((item) => item.id === productId);
        const nextItems: CartProductLine[] = existing
          ? items.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
            )
          : [...items, { id: productId, quantity: 1 }];

        patchState(store, { status: 'loading', error: null });

        return cartService.addToCart(userId, nextItems).pipe(
          tap((cart) => {
            patchState(store, {
              items: nextItems,
              count: cart.totalQuantity,
              status: 'idle',
              error: null,
            });
          }),
          catchError(() => {
            // Not optimistic — items/count are only patched on a confirmed
            // response above, so a failure here has nothing to roll back.
            patchState(store, { status: 'error', error: 'Could not add to cart. Please try again.' });
            return EMPTY;
          }),
        );
      }),
    ),
  })),
);
