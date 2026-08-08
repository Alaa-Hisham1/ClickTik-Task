import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type LogoSize = 'sm' | 'md';

// Decorative brand mark reused across the header, footer, and login card —
// aria-hidden at the host since it's always paired with visible "ClickTik" text
// or a heading that already conveys context.
@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class Logo {
  readonly size = input<LogoSize>('sm');
}
