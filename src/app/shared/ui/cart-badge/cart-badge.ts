import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-cart-badge',
  imports: [],
  templateUrl: './cart-badge.html',
  styleUrl: './cart-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartBadge {
  readonly count = input(0);

  readonly activated = output<void>();

  protected readonly label = computed(() =>
    this.count() === 1 ? 'Cart, 1 item' : `Cart, ${this.count()} items`,
  );
}
