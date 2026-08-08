import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

let nextTextFieldId = 0;

@Component({
  selector: 'app-text-field',
  imports: [],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField {
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input<string | null>(null);

  readonly value = model('');

  // Unique per instance so <label for> keeps working when a form renders more than one field.
  protected readonly id = `text-field-${nextTextFieldId++}`;
  protected readonly errorId = `${this.id}-error`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
