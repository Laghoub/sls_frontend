import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import { CashMovement, CashMovementRequest } from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class CashMovementService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/cash-movements`;
  search(sessionId: number, page = 0, size = 20) {
    const p = new HttpParams()
      .set('sessionId', sessionId)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<CashMovement>>(this.url, { params: p });
  }
  create(r: CashMovementRequest) {
    return this.http.post<CashMovement>(this.url, r);
  }
}
