import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

let nextSelectId = 0;

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Select {
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input<string | null>(null);

  readonly value = model('');

  protected readonly id = `select-${nextSelectId++}`;
  protected readonly errorId = `${this.id}-error`;

  protected onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
