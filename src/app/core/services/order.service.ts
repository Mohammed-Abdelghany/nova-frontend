import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { Order, OrderPayload } from '../models/order.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/orders`;

  createOrder(payload: OrderPayload) {
    return this.http.post<Order>(this.baseUrl, payload);
  }

  getOrders(page: number, size: number) {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<Page<Order>>(this.baseUrl, { params });
  }
}
