import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { Coupon, CouponCreateRequest, CouponValidationResponse } from '../models/coupon.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/coupons`;

  getPage(page: number, size: number) {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<Page<Coupon>>(this.baseUrl, { params });
  }

  validate(code: string, amount: number) {
    const params = new HttpParams().set('code', code).set('amount', amount);
    return this.http.get<CouponValidationResponse>(`${this.baseUrl}/validate`, { params });
  }

  addCoupon(request: CouponCreateRequest) {
    return this.http.post<Coupon>(this.baseUrl, request);
  }

  deleteCoupon(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
