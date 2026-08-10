import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';

import { Product, ProductCategory } from './interfaces/product';
import { ProductsService } from './products.service';

interface ProductsState {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  category: string | null;
  search: string | null;
  categories: ProductCategory[];
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  total: 0,
  page: 1,
  limit: 9,
  category: null,
  search: null,
  categories: [],
  status: 'idle',
  error: null,
};

export interface ProductsQuery {
  page: number;
  category: string | null;
  search: string | null;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ total, limit, status }) => ({
    totalPages: computed(() => Math.max(1, Math.ceil(total() / limit()))),
    loading: computed(() => status() === 'loading'),
  })),
  withMethods((store, productsService = inject(ProductsService)) => ({
    // Fed a signal from the component (page/category/search from the URL) —
    // switchMap means a fast change (typing, clicking pages) cancels the
    // stale in-flight request instead of racing it, and catchError sits on
    // the inner per-request pipe so one failed query doesn't kill the
    // method for the next one.
    load: rxMethod<ProductsQuery>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap(({ page, category, search }) => {
          const limit = store.limit();
          const skip = (page - 1) * limit;
          // DummyJSON has no endpoint that combines search + category —
          // a free-text search takes priority over a category selection.
          const request$ = search
            ? productsService.searchProducts(search, { limit, skip })
            : category
              ? productsService.getProductsByCategory(category, { limit, skip })
              : productsService.getProducts({ limit, skip });

          return request$.pipe(
            tap((response) => {
              patchState(store, {
                products: response.products,
                total: response.total,
                page,
                category,
                search,
                status: 'idle',
                error: null,
              });
            }),
            catchError(() => {
              patchState(store, {
                products: [],
                status: 'error',
                error: 'Could not load products. Please try again.',
              });
              return EMPTY;
            }),
          );
        }),
      ),
    ),
    loadCategories(): void {
      productsService.getCategories().subscribe({
        next: (categories) => patchState(store, { categories }),
        error: () => patchState(store, { categories: [] }),
      });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadCategories();
    },
  }),
);
