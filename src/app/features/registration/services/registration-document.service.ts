import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  RegistrationDocumentStatus,
  RegistrationDocumentStatusRequest,
} from '../models/registration.model';
@Injectable({ providedIn: 'root' })
export class RegistrationDocumentService {
  private http = inject(HttpClient);
  private base = API_CONFIG.baseUrl;
  list(id: number) {
    return this.http.get<RegistrationDocumentStatus[]>(
      `${this.base}/registrations/${id}/documents`,
    );
  }
  save(id: number, r: RegistrationDocumentStatusRequest) {
    return this.http.put<RegistrationDocumentStatus>(
      `${this.base}/registrations/${id}/documents`,
      r,
    );
  }
}
