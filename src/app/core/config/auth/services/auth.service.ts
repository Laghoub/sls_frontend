import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_CONFIG } from '../../../api.config';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AuthUser } from '../models/auth-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly currentUserSignal =
    signal<AuthUser | null>(null);

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly isAuthenticated = computed(
    () => this.currentUserSignal() !== null
  );

  readonly mustChangePassword = computed(
    () => this.currentUserSignal()?.mustChangePassword ?? false
  );

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${API_CONFIG.baseUrl}/auth/login`,
        request
      )
      .pipe(
        tap(response => {
          this.currentUserSignal.set(response.user);
        })
      );
  }

  loadCurrentUser(): Observable<AuthUser> {

    return this.http
      .get<AuthUser>(
        `${API_CONFIG.baseUrl}/auth/me`
      )
      .pipe(
        tap(user => {
          this.currentUserSignal.set(user);
        })
      );
  }

  logout(): Observable<void> {

    return this.http
      .post<void>(
        `${API_CONFIG.baseUrl}/auth/logout`,
        {}
      )
      .pipe(
        tap(() => {
          this.currentUserSignal.set(null);
        })
      );
  }

  hasPermission(
    permission: string
  ): boolean {

    const user =
      this.currentUserSignal();

    if (!user) {
      return false;
    }

    return user.permissions.includes(permission);
  }

  hasRole(
    role: string
  ): boolean {

    const user =
      this.currentUserSignal();

    if (!user) {
      return false;
    }

    return user.roles.includes(role);
  }

  clearUser(): void {
    this.currentUserSignal.set(null);
  }

changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Observable<void> {

  return this.http.post<void>(
    `${API_CONFIG.baseUrl}/auth/change-password`,
    {
      currentPassword,
      newPassword,
      confirmPassword
    }
  );
}
}