import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PageToken = number | '…';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  // Always shows first/last page plus a small window around the current page,
  // collapsing everything else behind an ellipsis rather than rendering every
  // page number for a large catalog.
  protected readonly pages = computed<PageToken[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) {
      return total === 1 ? [1] : [];
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    const tokens: PageToken[] = [1];
    if (start > 2) {
      tokens.push('…');
    }
    for (let page = start; page <= end; page++) {
      tokens.push(page);
    }
    if (end < total - 1) {
      tokens.push('…');
    }
    tokens.push(total);

    return tokens;
  });

  protected goTo(page: PageToken): void {
    if (page === '…' || page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }
    this.pageChange.emit(page);
  }
}
