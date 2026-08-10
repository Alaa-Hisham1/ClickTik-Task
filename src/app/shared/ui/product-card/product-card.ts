import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Button } from '../button/button';

@Component({
  selector: 'app-product-card',
  imports: [Button],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly image = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input('');
  readonly badge = input<string | null>(null);

  readonly price = input.required<number>();
  readonly originalPrice = input<number | null>(null);
  readonly currency = input('USD');

  readonly brand = input('');
  readonly category = input('');
  readonly inStock = input(true);

  readonly rating = input(0);
  readonly reviewCount = input(0);

  readonly addToCart = output<void>();

  protected readonly formattedPrice = computed(() => this.price().toFixed(2));
  protected readonly formattedOriginalPrice = computed(() => this.originalPrice()?.toFixed(2));
  protected readonly formattedRating = computed(() => this.rating().toFixed(2));
  protected readonly ratingLabel = computed(
    () => `Rated ${this.formattedRating()} out of 5, from ${this.reviewCount()} reviews`,
  );
}
