import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthStore } from '../../../core/auth/auth.store';
import { Button } from '../../../shared/ui/button/button';
import { Logo } from '../../../shared/ui/logo/logo';
import { TextField } from '../../../shared/ui/text-field/text-field';

@Component({
  selector: 'app-login',
  imports: [TextField, Button, Logo],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly loading = this.authStore.loading;
  protected readonly error = this.authStore.error;

  constructor() {
    // Side effect (navigation), not derived state — computed() can't call the
    // router, so effect() is the right tool for reacting to auth state here.
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    // Reads the signal directly rather than relying on the button's disabled
    // attribute — that DOM update lags a render behind the signal write, so a
    // fast enough repeat click could otherwise slip through and fire a second
    // request before the button visually disables.
    if (this.loading()) {
      return;
    }

    this.authStore.login({ username: this.username(), password: this.password() });
  }
}
