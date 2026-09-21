import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { Order } from '../../../../core/models/order.model';
import { Page } from '../../../../core/models/page.model';
import { OrderService } from '../../../../core/services/order.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Pagination } from '../../../../shared/pagination/pagination';

const PAGE_SIZE = 10;

const EMPTY_PAGE: Page<Order> = { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true };

@Component({
  selector: 'app-orders-page',
  imports: [Pagination],
  templateUrl: './orders-page.html'
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);

  protected readonly result = signal<Page<Order>>(EMPTY_PAGE);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.fetchPage(0);
  }

  fetchPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getOrders(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.result.set(result);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل الطلبات، حاولي مرة أخرى لاحقًا'));
      }
    });
  }
}
