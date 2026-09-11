import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import { FamilyCredit } from '../models/finance.model';
import {
  FamilyCreditApplyRequest,
  FamilyCreditUsage,
} from '../models/finance-tracking.model';

@Injectable({ providedIn: 'root' })
export class FamilyCreditService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/family-credits`;

  search(guardianId: number, page = 0, size = 20) {
    const p = new HttpParams()
      .set('guardianId', guardianId)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<FamilyCredit>>(this.url, { params: p });
  }

  usages(id: number) {
    return this.http.get<FamilyCreditUsage[]>(`${this.url}/${id}/usages`);
  }

  apply(id: number, request: FamilyCreditApplyRequest) {
    return this.http.post<FamilyCreditUsage>(`${this.url}/${id}/apply`, request);
  }
}
