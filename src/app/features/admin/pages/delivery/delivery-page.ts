import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DeliveryFee } from '../../../../core/models/delivery-fee.model';
import { DeliveryFeeService } from '../../../../core/services/delivery-fee.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

@Component({
  selector: 'app-delivery-page',
  imports: [FormsModule, Spinner],
  templateUrl: './delivery-page.html'
})
export class DeliveryPage {
  private readonly deliveryFeeService = inject(DeliveryFeeService);
  private readonly toastService = inject(ToastService);

  protected readonly fees = signal<DeliveryFee[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly editedFees = signal<Partial<Record<number, number>>>({});
  protected readonly savingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.deliveryFeeService.getAll().subscribe({
      next: (fees) => {
        this.loading.set(false);
        this.fees.set(fees);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل رسوم التوصيل'));
      }
    });
  }

  onFeeInput(id: number, value: number): void {
    this.editedFees.update((edited) => ({ ...edited, [id]: value }));
  }

  isEdited(fee: DeliveryFee): boolean {
    const edited = this.editedFees()[fee.id];
    return edited != null && edited !== fee.fee;
  }

  save(fee: DeliveryFee): void {
    const newFee = this.editedFees()[fee.id];
    if (newFee == null || this.savingId() === fee.id) {
      return;
    }

    this.savingId.set(fee.id);

    this.deliveryFeeService.update(fee.id, newFee).subscribe({
      next: (updated) => {
        this.savingId.set(null);
        this.fees.update((fees) => fees.map((f) => (f.id === updated.id ? updated : f)));
        this.toastService.success(`تم تحديث رسوم التوصيل لـ ${updated.governorate}`);
      },
      error: (error: HttpErrorResponse) => {
        this.savingId.set(null);
        this.toastService.error(extractErrorMessage(error, 'تعذر تحديث الرسوم، حاولي مرة أخرى'));
      }
    });
  }
}
