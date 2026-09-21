import { Injectable, computed, signal } from '@angular/core';

import { CartLine } from '../models/cart.model';
import { Product } from '../models/product.model';

const CART_KEY = 'pharmaglow_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _lines = signal<CartLine[]>(readStoredCart());
  readonly lines = this._lines.asReadonly();

  private readonly _drawerOpen = signal(false);
  readonly drawerOpen = this._drawerOpen.asReadonly();

  openDrawer(): void {
    this._drawerOpen.set(true);
  }

  closeDrawer(): void {
    this._drawerOpen.set(false);
  }

  readonly itemCount = computed(() => this._lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly subtotal = computed(() =>
    this._lines().reduce((sum, line) => sum + line.product.finalPrice * line.quantity, 0)
  );

  isEmpty(): boolean {
    return this._lines().length === 0;
  }

  quantityOf(productId: number): number {
    return this._lines().find((line) => line.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product, quantity = 1): void {
    this._lines.update((lines) => {
      const existing = lines.find((line) => line.product.id === product.id);
      if (existing) {
        return lines.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...lines, { product, quantity }];
    });
    this.persist();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this._lines.update((lines) =>
      lines.map((line) => (line.product.id === productId ? { ...line, quantity } : line))
    );
    this.persist();
  }

  remove(productId: number): void {
    this._lines.update((lines) => lines.filter((line) => line.product.id !== productId));
    this.persist();
  }

  clear(): void {
    this._lines.set([]);
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this._lines()));
    } catch {
      // Storage unavailable (private browsing, quota) - cart just won't survive a refresh.
    }
  }
}

function readStoredCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}
