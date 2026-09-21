import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ChangePasswordRequest, LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'pharmaglow_token';
const USERNAME_KEY = 'pharmaglow_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  private readonly _token = signal<string | null>(readStoredToken());
  private readonly _username = signal<string | null>(localStorage.getItem(USERNAME_KEY));

  readonly username = this._username.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  token(): string | null {
    return this._token();
  }

  login(request: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.setSession(response.token, response.username)));
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.put<void>(`${this.baseUrl}/change-password`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this._token.set(null);
    this._username.set(null);
  }

  private setSession(token: string, username: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    this._token.set(token);
    this._username.set(username);
  }
}

function readStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    return null;
  }

  return token;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    if (!payload.exp) {
      return false;
    }
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
