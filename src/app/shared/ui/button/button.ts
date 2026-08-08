import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary-gray';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly clicked = output<void>();

  protected readonly classList = computed(() =>
    [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'btn--full-width' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected onClick(): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.clicked.emit();
  }
}
