import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  RegistrationInfo,
  RegistrationInfoRequest,
} from '../models/registration.model';
@Injectable({ providedIn: 'root' })
export class RegistrationInfoService {
  private http = inject(HttpClient);
  private base = `${API_CONFIG.baseUrl}/registrations`;
  get(id: number) {
    return this.http.get<RegistrationInfo>(`${this.base}/${id}/info`);
  }
  save(id: number, r: RegistrationInfoRequest) {
    return this.http.put<RegistrationInfo>(`${this.base}/${id}/info`, r);
  }
}
