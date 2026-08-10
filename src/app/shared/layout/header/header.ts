import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';

import { AuthStore } from '../../../core/auth/auth.store';
import { Button } from '../../ui/button/button';
import { CartBadge } from '../../ui/cart-badge/cart-badge';
import { Logo } from '../../ui/logo/logo';

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

  protected readonly searchQuery = signal('');

  // Not wired to anything yet — there's no live product search to drive.
  // Kept as an output so the eventual products feature can subscribe to it
  // without Header needing to know that feature exists.
  readonly search = output<string>();

  protected onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.searchQuery());
  }
}
