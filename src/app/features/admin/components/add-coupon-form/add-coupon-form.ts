import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Coupon, CouponCreateRequest, DiscountType } from '../../../../core/models/coupon.model';
import { CouponService } from '../../../../core/services/coupon.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-add-coupon-form',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './add-coupon-form.html'
})
export class AddCouponForm {
  private readonly fb = inject(FormBuilder);
  private readonly couponService = inject(CouponService);
  private readonly toastService = inject(ToastService);

  readonly added = output<Coupon>();

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    discountType: ['PERCENTAGE' as DiscountType, [Validators.required]],
    value: [10, [Validators.required, Validators.min(0.01)]],
    expiryDate: ['']
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { code, discountType, value, expiryDate } = this.form.getRawValue();

    const request: CouponCreateRequest = {
      code: code.trim().toUpperCase(),
      discountType,
      value,
      expiryDate: expiryDate ? expiryDate : null
    };

    this.couponService.addCoupon(request).subscribe({
      next: (coupon) => {
        this.submitting.set(false);
        this.toastService.success('تمت إضافة الكوبون بنجاح');
        this.resetForm();
        this.added.emit(coupon);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.toastService.error(extractErrorMessage(error, 'تعذر إضافة الكوبون، حاولي مرة أخرى'));
      }
    });
  }

  private resetForm(): void {
    this.form.reset({ code: '', discountType: 'PERCENTAGE', value: 10, expiryDate: '' });
  }
}
