import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  DiscountApplicationResponse,
  DiscountRule,
  DiscountRuleRequest,
} from '../models/discount.model';

@Injectable({ providedIn: 'root' })
export class DiscountRuleService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/discount-rules`;

  list(schoolYearId: number) {
    const params = new HttpParams().set('schoolYearId', schoolYearId);
    return this.http.get<DiscountRule[]>(this.url, { params });
  }

  create(request: DiscountRuleRequest) {
    return this.http.post<DiscountRule>(this.url, request);
  }

  update(id: number, request: DiscountRuleRequest) {
    return this.http.put<DiscountRule>(`${this.url}/${id}`, request);
  }

  apply(id: number) {
    return this.http.post<DiscountApplicationResponse>(`${this.url}/${id}/apply`, {});
  }
}
