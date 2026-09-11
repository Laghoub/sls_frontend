import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  RegistrationConsent,
  RegistrationConsentRequest,
} from '../models/registration.model';
@Injectable({ providedIn: 'root' })
export class RegistrationConsentService {
  private http = inject(HttpClient);
  private base = `${API_CONFIG.baseUrl}/registrations`;
  list(id: number) {
    return this.http.get<RegistrationConsent[]>(`${this.base}/${id}/consents`);
  }
  save(id: number, r: RegistrationConsentRequest) {
    return this.http.put<RegistrationConsent>(`${this.base}/${id}/consents`, r);
  }
}
