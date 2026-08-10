import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { LoadingSkeleton } from '../../../shared/ui/loading-skeleton/loading-skeleton';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { CartStore } from '../../cart/cart.store';
import { Product } from '../interfaces/product';
import { ProductsStore } from '../products.store';

@Component({
  selector: 'app-product-page',
  imports: [ProductCard, Pagination, EmptyState, Button, LoadingSkeleton],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage {
  // Bound straight from the URL by withComponentInputBinding() (see
  // app.config.ts) — the URL is the only place page/category/search state
  // lives, which is what makes this route shareable and refresh-safe.
  readonly page = input('1');
  readonly category = input<string | null>(null);
  readonly search = input<string | null>(null);

  protected readonly productsStore = inject(ProductsStore);
  protected readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly query = computed(() => ({
    page: Number(this.page()) || 1,
    category: this.category(),
    search: this.search(),
  }));

  protected readonly selectedCategory = computed(() => this.category() ?? 'all');
  protected readonly selectedCategoryName = computed(() => {
    const slug = this.category();
    if (!slug) {
      return null;
    }
    return this.productsStore.categories().find((c) => c.slug === slug)?.name ?? slug;
  });

  protected readonly skeletonPlaceholders = computed(() =>
    Array.from({ length: this.productsStore.limit() }),
  );

  constructor() {
    // rxMethod fed a computed signal — it re-fetches by itself whenever the
    // URL-derived page/category/search changes, no effect() needed to
    // "watch" it.
    this.productsStore.load(this.query);
  }

  protected onPageChange(page: number): void {
    this.navigate({ page });
  }

  protected onCategoryChange(category: string): void {
    // A category pick and a free-text search both drive the same request —
    // DummyJSON has no endpoint that combines them, so picking one clears
    // the other rather than leaving a stale, silently-ignored filter active.
    this.navigate({ category: category === 'all' ? null : category, search: null, page: 1 });
  }

  protected retry(): void {
    this.productsStore.load(this.query());
  }

  protected originalPrice(product: Product): number | null {
    if (product.discountPercentage <= 0) {
      return null;
    }
    return product.price / (1 - product.discountPercentage / 100);
  }

  protected discountBadge(product: Product): string | null {
    if (product.discountPercentage <= 0) {
      return null;
    }
    return `${product.discountPercentage.toFixed(2)}%`;
  }

  protected onAddToCart(product: Product): void {
    this.cartStore.addToCart(product.id);
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
