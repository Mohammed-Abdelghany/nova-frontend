import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_BASE_URL } from '../config/api.config';
import { ContactPayload } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/contact`;

  submit(payload: ContactPayload) {
    return this.http.post<void>(this.baseUrl, payload);
  }
}
