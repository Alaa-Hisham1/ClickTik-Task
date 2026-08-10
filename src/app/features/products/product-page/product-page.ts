import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-product-page',
  imports: [],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage {
  protected readonly authStore = inject(AuthStore);
}