import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CartService } from './core/services/cart.service';
import { CartDrawer } from './features/landing/components/cart-drawer/cart-drawer';
import { CheckoutModal } from './features/landing/components/checkout-modal/checkout-modal';
import { ToastContainer } from './shared/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer, CartDrawer, CheckoutModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly cartService = inject(CartService);
  protected readonly checkoutOpen = signal(false);

  onCheckout(): void {
    this.cartService.closeDrawer();
    this.checkoutOpen.set(true);
  }

  onCheckoutClosed(): void {
    this.checkoutOpen.set(false);
  }
}
