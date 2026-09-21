import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../../core/services/cart.service';
import { ThemeToggle } from '../../../../shared/theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ThemeToggle],
  templateUrl: './header.html'
})
export class Header {
  protected readonly cartService = inject(CartService);

  openCart(): void {
    this.cartService.openDrawer();
  }
}
