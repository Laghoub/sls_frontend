import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  Payment,
  PaymentCreateRequest,
  PaymentDetail,
} from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/payments`;
  search(guardianId: number | null, page = 0, size = 20) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (guardianId != null) p = p.set('guardianId', guardianId);
    return this.http.get<PageResponse<Payment>>(this.url, { params: p });
  }
  get(id: number) {
    return this.http.get<PaymentDetail>(`${this.url}/${id}`);
  }
  create(r: PaymentCreateRequest) {
    return this.http.post<PaymentDetail>(this.url, r);
  }
  cancel(id: number, reason: string) {
    return this.http.post<Payment>(`${this.url}/${id}/cancel`, { reason });
  }
}
