import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Spinner } from '../../../../shared/spinner/spinner';

interface ImagePreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-add-product-form',
  imports: [ReactiveFormsModule, Spinner],
  templateUrl: './add-product-form.html'
})
export class AddProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  readonly added = output<Product>();

  protected readonly categorySuggestions = signal<string[]>([]);
  protected readonly submitting = signal(false);
  protected readonly imagePreviews = signal<ImagePreview[]>([]);
  protected readonly fileError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required]],
    discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
    available: [true]
  });

  constructor() {
    this.productService.getCategories().subscribe((categories) => this.categorySuggestions.set(categories));
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) {
      return;
    }

    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    this.imagePreviews.update((previews) => [...previews, ...newPreviews]);
    this.fileError.set(null);
    input.value = '';
  }

  removeImage(index: number): void {
    this.imagePreviews.update((previews) => {
      URL.revokeObjectURL(previews[index].url);
      return previews.filter((_, i) => i !== index);
    });
  }

  submit(): void {
    const images = this.imagePreviews().map((p) => p.file);

    if (this.form.invalid || images.length === 0) {
      this.form.markAllAsTouched();
      if (images.length === 0) {
        this.fileError.set('من فضلك اختاري صورة واحدة على الأقل للمنتج');
      }
      return;
    }

    this.submitting.set(true);

    this.productService.addProduct(this.form.getRawValue(), images).subscribe({
      next: (product) => {
        this.submitting.set(false);
        this.toastService.success('تمت إضافة المنتج بنجاح');
        this.resetForm();
        this.added.emit(product);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.toastService.error(extractErrorMessage(error, 'تعذر إضافة المنتج، حاولي مرة أخرى'));
      }
    });
  }

  private resetForm(): void {
    this.form.reset({ title: '', description: '', price: 0, category: '', discountPercentage: 0, available: true });

    this.imagePreviews().forEach((p) => URL.revokeObjectURL(p.url));
    this.imagePreviews.set([]);
  }
}
