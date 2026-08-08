import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthSession, LoginRequest, RefreshResponse } from './interfaces/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest) {
    return this.http.post<AuthSession>(`${environment.apiBaseUrl}/auth/login`, credentials);
  }

  refresh(refreshToken: string) {
    return this.http.post<RefreshResponse>(`${environment.apiBaseUrl}/auth/refresh`, {
      refreshToken,
    });
  }
}
