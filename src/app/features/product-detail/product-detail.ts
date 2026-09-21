import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { extractErrorMessage } from '../../core/utils/api-error.util';
import { ThemeToggle } from '../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ThemeToggle],
  templateUrl: './product-detail.html'
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  protected readonly cartService = inject(CartService);

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeImageIndex = signal(0);
  protected readonly quantity = signal(1);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.activeImageIndex.set(0);
    this.quantity.set(1);

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.product.set(product);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(extractErrorMessage(error, 'تعذر تحميل بيانات المنتج'));
      }
    });
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  previousImage(): void {
    this.activeImageIndex.update((i) => Math.max(0, i - 1));
  }

  nextImage(): void {
    const total = this.product()?.images.length ?? 0;
    this.activeImageIndex.update((i) => Math.min(total - 1, i + 1));
  }

  incrementQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    const product = this.product();
    if (!product || !product.available) {
      return;
    }
    this.cartService.add(product, this.quantity());
    this.cartService.openDrawer();
  }

  openCart(): void {
    this.cartService.openDrawer();
  }
}
