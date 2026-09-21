import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
  { path: '', component: Landing },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/pages/dashboard/dashboard-page').then((m) => m.DashboardPage)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/pages/products/products-page').then((m) => m.ProductsPage)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/pages/orders/orders-page').then((m) => m.OrdersPage)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/pages/coupons/coupons-page').then((m) => m.CouponsPage)
      },
      {
        path: 'delivery',
        loadComponent: () => import('./features/admin/pages/delivery/delivery-page').then((m) => m.DeliveryPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/pages/settings/settings-page').then((m) => m.SettingsPage)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound)
  }
];
