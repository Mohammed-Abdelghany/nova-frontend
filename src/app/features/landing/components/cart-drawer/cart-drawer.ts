import { Component, inject, output, signal } from '@angular/core';

import { CartLine } from '../../../../core/models/cart.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.html'
})
export class CartDrawer {
  protected readonly cartService = inject(CartService);
  readonly checkout = output<void>();

  protected readonly clearConfirming = signal(false);

  close(): void {
    this.cartService.closeDrawer();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  increment(line: CartLine): void {
    this.cartService.updateQuantity(line.product.id, line.quantity + 1);
  }

  decrement(line: CartLine): void {
    this.cartService.updateQuantity(line.product.id, line.quantity - 1);
  }

  remove(line: CartLine): void {
    this.cartService.remove(line.product.id);
  }

  startCheckout(): void {
    this.checkout.emit();
  }
}
