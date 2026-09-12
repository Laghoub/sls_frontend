import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  BillingCreationResponse,
  BillingPreview,
  TariffBillingRequest,
} from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class TariffBillingService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/billing`;

  preview(request: TariffBillingRequest) {
    return this.http.post<BillingPreview>(`${this.url}/preview`, request);
  }

  create(request: TariffBillingRequest) {
    return this.http.post<BillingCreationResponse>(this.url, request);
  }
}
