import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Order } from '../../../../core/models/order.model';
import { CouponService } from '../../../../core/services/coupon.service';
import { OrderService } from '../../../../core/services/order.service';
import { ProductService } from '../../../../core/services/product.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  activeCoupons: number;
}

const EMPTY_STATS: DashboardStats = { totalProducts: 0, totalOrders: 0, pendingOrders: 0, activeCoupons: 0 };

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html'
})
export class DashboardPage {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly couponService = inject(CouponService);

  protected readonly stats = signal<DashboardStats>(EMPTY_STATS);
  protected readonly recentOrders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      products: this.productService.getPage(0, 1),
      recentOrders: this.orderService.getOrders(0, 5),
      allOrders: this.orderService.getOrders(0, 100),
      coupons: this.couponService.getPage(0, 100)
    }).subscribe({
      next: ({ products, recentOrders, allOrders, coupons }) => {
        this.loading.set(false);
        this.recentOrders.set(recentOrders.content);
        this.stats.set({
          totalProducts: products.totalElements,
          totalOrders: recentOrders.totalElements,
          pendingOrders: allOrders.content.filter((order) => order.status === 'PENDING').length,
          activeCoupons: coupons.content.filter((coupon) => coupon.active).length
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل بيانات لوحة التحكم'));
      }
    });
  }
}
