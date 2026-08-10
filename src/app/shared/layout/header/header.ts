import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import { AuthStore } from '../../../core/auth/auth.store';
import { Button } from '../../ui/button/button';
import { CartBadge } from '../../ui/cart-badge/cart-badge';
import { Logo } from '../../ui/logo/logo';

export const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-header',
  imports: [Button, Logo, CartBadge],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // Layout components may read app-wide state directly (unlike shared/ui
  // atoms) — this is what decides "Log In" vs. search+cart below.
  protected readonly authStore = inject(AuthStore);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Query params belong to the whole URL, not to whichever routed component
  // is active, so this stays correct even though Header sits outside
  // <router-outlet> — it's what makes the box reflect a deep-linked
  // ?search=... instead of always starting empty.
  private readonly searchFromUrl = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('search') ?? '')),
    { initialValue: '' },
  );

  // Writable, but resets to the URL's value whenever that changes externally
  // (deep link, browser back/forward, clearing search from elsewhere) —
  // linkedSignal is exactly this "derived, but locally overridable" shape.
  protected readonly searchQuery = linkedSignal(() => this.searchFromUrl());

  constructor() {
    // Debounce-then-navigate lives here (human typing timing); switchMap-based
    // in-flight request cancellation lives in ProductsStore.load (network
    // timing) — two different concerns, two different tools.
    toObservable(this.searchQuery)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        // Without this guard, a category change elsewhere (which resets the
        // URL's search param) would round-trip back through this pipeline
        // and immediately clear that same category again.
        if (value !== this.searchFromUrl()) {
          this.navigateSearch(value);
        }
      });
  }

  protected onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.navigateSearch(this.searchQuery());
  }

  private navigateSearch(value: string): void {
    this.router.navigate(['/products'], {
      queryParams: { search: value || null, category: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}
