import { ChangeDetectionStrategy, Component } from '@angular/core';

// One card-shaped placeholder — the consumer @for's this to fill a grid,
// same as it would with real ProductCards.
@Component({
  selector: 'app-loading-skeleton',
  imports: [],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'presentation', 'aria-hidden': 'true' },
})
export class LoadingSkeleton {}
