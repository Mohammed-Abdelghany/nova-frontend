import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggle } from '../../../shared/theme-toggle/theme-toggle';

interface AdminNavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './admin-shell.html'
})
export class AdminShell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly username = this.authService.username;
  protected readonly mobileNavOpen = signal(false);

  protected readonly navLinks: AdminNavLink[] = [
    { path: 'dashboard', label: 'نظرة عامة', icon: 'grid' },
    { path: 'products', label: 'المنتجات', icon: 'box' },
    { path: 'orders', label: 'الطلبات', icon: 'cart' },
    { path: 'coupons', label: 'الكوبونات', icon: 'tag' },
    { path: 'delivery', label: 'التوصيل', icon: 'truck' },
    { path: 'settings', label: 'الإعدادات', icon: 'gear' }
  ];

  toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
