import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { EGYPT_GOVERNORATES } from '../../../../core/constants/governorates';
import { CouponValidationResponse } from '../../../../core/models/coupon.model';
import { DeliveryFee } from '../../../../core/models/delivery-fee.model';
import { Order, OrderItemPayload, OrderPayload } from '../../../../core/models/order.model';
import { CartService } from '../../../../core/services/cart.service';
import { CouponService } from '../../../../core/services/coupon.service';
import { DeliveryFeeService } from '../../../../core/services/delivery-fee.service';
import { OrderService } from '../../../../core/services/order.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

type ModalState = 'form' | 'success';

@Component({
  selector: 'app-checkout-modal',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './checkout-modal.html'
})
export class CheckoutModal {
  protected readonly cartService = inject(CartService);
  private readonly couponService = inject(CouponService);
  private readonly orderService = inject(OrderService);
  private readonly deliveryFeeService = inject(DeliveryFeeService);
  private readonly fb = inject(FormBuilder);

  readonly closed = output<void>();

  protected readonly governorates = EGYPT_GOVERNORATES;
  protected readonly state = signal<ModalState>('form');
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly placedOrder = signal<Order | null>(null);

  protected readonly couponControl = new FormControl('', { nonNullable: true });
  protected readonly verifyingCoupon = signal(false);
  protected readonly verifiedCoupon = signal<CouponValidationResponse | null>(null);
  protected readonly couponError = signal<string | null>(null);

  protected readonly deliveryFees = signal<DeliveryFee[]>([]);
  protected readonly selectedGovernorate = signal('');

  protected readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(3)]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    governorate: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]]
  });

  protected readonly deliveryFee = computed(() => {
    const governorate = this.selectedGovernorate();
    return this.deliveryFees().find((f) => f.governorate === governorate)?.fee ?? 0;
  });

  protected readonly total = computed(() => {
    const subtotal = this.cartService.subtotal();
    const discount = this.verifiedCoupon()?.discountAmount ?? 0;
    return Math.max(subtotal - discount, 0) + this.deliveryFee();
  });

  constructor() {
    this.deliveryFeeService.getAll().subscribe((fees) => this.deliveryFees.set(fees));
  }

  onGovernorateChange(value: string): void {
    this.selectedGovernorate.set(value);
  }

  onCouponInput(): void {
    if (this.verifiedCoupon()) {
      this.verifiedCoupon.set(null);
    }
    this.couponError.set(null);
  }

  verifyCoupon(): void {
    const code = this.couponControl.value.trim();
    if (!code || this.verifyingCoupon()) {
      return;
    }

    this.verifyingCoupon.set(true);
    this.couponError.set(null);

    this.couponService.validate(code, this.cartService.subtotal()).subscribe({
      next: (result) => {
        this.verifyingCoupon.set(false);
        this.verifiedCoupon.set(result);
      },
      error: (error: HttpErrorResponse) => {
        this.verifyingCoupon.set(false);
        this.verifiedCoupon.set(null);
        this.couponError.set(extractErrorMessage(error, 'كود الخصم غير صالح'));
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting() || this.cartService.isEmpty()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const items: OrderItemPayload[] = this.cartService.lines().map((line) => ({
      productId: line.product.id,
      quantity: line.quantity
    }));

    const payload: OrderPayload = { ...this.form.getRawValue(), items };

    const code = this.couponControl.value.trim();
    if (code) {
      payload.couponCode = code;
    }

    this.orderService.createOrder(payload).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.placedOrder.set(order);
        this.state.set('success');
        this.cartService.clear();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(extractErrorMessage(error, 'تعذر إرسال طلبك، من فضلك حاولي مرة أخرى'));
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
