import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

import { Page } from '../../../../core/models/page.model';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { extractErrorMessage } from '../../../../core/utils/api-error.util';
import { Pagination } from '../../../../shared/pagination/pagination';
import { Spinner } from '../../../../shared/spinner/spinner';
import { AddProductForm } from '../../components/add-product-form/add-product-form';

const PAGE_SIZE = 8;

const EMPTY_PAGE: Page<Product> = { content: [], page: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0, last: true };

@Component({
  selector: 'app-products-page',
  imports: [AddProductForm, Pagination, Spinner],
  templateUrl: './products-page.html'
})
export class ProductsPage {
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  protected readonly result = signal<Page<Product>>(EMPTY_PAGE);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  constructor() {
    this.fetchPage(0);
  }

  fetchPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getPage(page, PAGE_SIZE).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.result.set(result);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل المنتجات، حاولي مرة أخرى لاحقًا'));
      }
    });
  }

  onProductAdded(): void {
    this.fetchPage(0);
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`هل أنت متأكدة من حذف "${product.title}"؟`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(product.id);
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.toastService.success('تم حذف المنتج');
        const isLastItemOnPage = this.result().content.length === 1 && this.result().page > 0;
        this.fetchPage(isLastItemOnPage ? this.result().page - 1 : this.result().page);
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId.set(null);
        this.toastService.error(extractErrorMessage(error, 'تعذر حذف المنتج، حاولي مرة أخرى'));
      }
    });
  }
}
