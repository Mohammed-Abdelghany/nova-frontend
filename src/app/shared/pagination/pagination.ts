import { Component, computed, input, output } from '@angular/core';

type PageToken = number | 'ellipsis';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html'
})
export class Pagination {
  /** 0-indexed current page, matching the backend's Pageable convention. */
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input.required<number>();
  readonly size = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly isFirst = computed(() => this.page() <= 0);
  protected readonly isLast = computed(() => this.page() >= this.totalPages() - 1);

  protected readonly rangeStart = computed(() => (this.totalElements() === 0 ? 0 : this.page() * this.size() + 1));
  protected readonly rangeEnd = computed(() => Math.min((this.page() + 1) * this.size(), this.totalElements()));

  protected readonly pageTokens = computed<PageToken[]>(() => buildPageTokens(this.page(), this.totalPages()));

  goTo(target: number): void {
    if (target < 0 || target > this.totalPages() - 1 || target === this.page()) {
      return;
    }
    this.pageChange.emit(target);
  }

  previous(): void {
    this.goTo(this.page() - 1);
  }

  next(): void {
    this.goTo(this.page() + 1);
  }
}

function buildPageTokens(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const tokens = new Set<number>([0, total - 1, current, current - 1, current + 1]);
  const sorted = [...tokens].filter((p) => p >= 0 && p <= total - 1).sort((a, b) => a - b);

  const result: PageToken[] = [];
  let previous: number | null = null;

  for (const p of sorted) {
    if (previous !== null && p - previous > 1) {
      result.push('ellipsis');
    }
    result.push(p);
    previous = p;
  }

  return result;
}
