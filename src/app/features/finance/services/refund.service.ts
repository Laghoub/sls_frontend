import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import { Refund, RefundRequest } from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class RefundService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/refunds`;
  search(paymentId: number, page = 0, size = 20) {
    const p = new HttpParams()
      .set('paymentId', paymentId)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Refund>>(this.url, { params: p });
  }
  create(r: RefundRequest) {
    return this.http.post<Refund>(this.url, r);
  }
}
