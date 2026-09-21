import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { Coupon } from '../../../../core/models/coupon.model';
import { Page } from '../../../../core/models/page.model';
import { CouponService } from '../../../../core/services/coupon.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Pagination } from '../../../../shared/pagination/pagination';
import { Spinner } from '../../../../shared/spinner/spinner';
import { AddCouponForm } from '../../components/add-coupon-form/add-coupon-form';

const PAGE_SIZE = 8;

const EMPTY_PAGE: Page<Coupon> = { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true };

@Component({
  selector: 'app-coupons-page',
  imports: [AddCouponForm, Pagination, Spinner],
  templateUrl: './coupons-page.html'
})
export class CouponsPage {
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);

  protected readonly result = signal<Page<Coupon>>(EMPTY_PAGE);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.fetchPage(0);
  }

  fetchPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.couponService.getPage(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.result.set(result);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل الكوبونات، حاولي مرة أخرى لاحقًا'));
      }
    });
  }

  onCouponAdded(): void {
    this.fetchPage(0);
  }

  isExpired(coupon: Coupon): boolean {
    return !!coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now();
  }

  deleteCoupon(coupon: Coupon): void {
    const confirmed = confirm(`هل أنت متأكدة من حذف الكوبون "${coupon.code}"؟`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(coupon.id);
    this.couponService.deleteCoupon(coupon.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.toastService.success('تم حذف الكوبون');
        const isLastItemOnPage = this.result().content.length === 1 && this.result().page > 0;
        this.fetchPage(isLastItemOnPage ? this.result().page - 1 : this.result().page);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.toastService.error(extractErrorMessage(error, 'تعذر حذف الكوبون، حاولي مرة أخرى'));
      }
    });
  }
}
