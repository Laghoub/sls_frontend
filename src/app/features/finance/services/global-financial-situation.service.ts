import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../../core/api.config';
import { GlobalFinancialSituation, GlobalSituationFilters } from '../models/global-financial-situation.model';

@Injectable({ providedIn: 'root' })
export class GlobalFinancialSituationService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/global-situation`;

  get(filters: GlobalSituationFilters) {
    let params = new HttpParams().set('schoolYearId', String(filters.schoolYearId));
    if (filters.classGroupId) params = params.set('classGroupId', String(filters.classGroupId));
    if (filters.parent.trim()) params = params.set('parent', filters.parent.trim());
    if (filters.cutoffMonth) params = params.set('cutoffMonth', String(filters.cutoffMonth));
    if (filters.status) params = params.set('status', filters.status);
    return this.http.get<GlobalFinancialSituation>(this.url, { params });
  }
}
