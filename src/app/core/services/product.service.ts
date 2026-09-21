import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { Page } from '../models/page.model';
import { Product, ProductCreateRequest, ProductFilters } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/products`;

  getPage(page: number, size: number, filters: ProductFilters = {}, sort = 'createdAt,desc') {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.minPrice != null) {
      params = params.set('minPrice', filters.minPrice);
    }
    if (filters.maxPrice != null) {
      params = params.set('maxPrice', filters.maxPrice);
    }
    if (filters.available != null) {
      params = params.set('available', filters.available);
    }

    return this.http.get<Page<Product>>(this.baseUrl, { params });
  }

  getCategories() {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  addProduct(request: ProductCreateRequest, images: File[]) {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    images.forEach((image) => formData.append('images', image));

    return this.http.post<Product>(this.baseUrl, formData);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
