import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html'
})
export class ProductCard {
  private readonly cartService = inject(CartService);

  readonly product = input.required<Product>();

  addToCart(): void {
    const product = this.product();
    if (!product.available) {
      return;
    }
    this.cartService.add(product);
    this.cartService.openDrawer();
  }
}
