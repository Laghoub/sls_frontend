import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  AdvancedFinanceDashboard,
  FinanceDashboardFilters,
} from '../models/finance-dashboard.model';

@Injectable({ providedIn: 'root' })
export class FinanceDashboardService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/dashboard/analytics`;

  analytics(filters: FinanceDashboardFilters) {
    let params = new HttpParams();

    const values: Record<string, string | number | null | undefined> = {
      schoolYearId: filters.schoolYearId,
      cycleId: filters.cycleId,
      levelId: filters.levelId,
      classGroupId: filters.classGroupId,
      campusId: filters.campusId,
      feeTypeId: filters.feeTypeId,
      paymentMethodId: filters.paymentMethodId,
      from: filters.from,
      to: filters.to,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<AdvancedFinanceDashboard>(this.url, { params });
  }
}
