import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { DeliveryFee } from '../models/delivery-fee.model';

@Injectable({ providedIn: 'root' })
export class DeliveryFeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/delivery-fees`;

  getAll() {
    return this.http.get<DeliveryFee[]>(this.baseUrl);
  }

  update(id: number, fee: number) {
    return this.http.put<DeliveryFee>(`${this.baseUrl}/${id}`, { fee });
  }
}
