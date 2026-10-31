import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../../../core/api.config';
import {
  AdvancedFinanceDashboard,
  FinanceDashboardFilters,
} from '../models/finance-dashboard.model';

@Injectable({ providedIn: 'root' })
export class FinanceDashboardService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/dashboard/analytics`;

  expensesSummary(filters: FinanceDashboardFilters) {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<FinanceExpensesSummaryResponse>(`${API_CONFIG.baseUrl}/finance/dashboard/expenses-summary`, { params }).pipe(
      map(data => ({
        cashInflows: Number(data.cashInflows ?? data.cashinflows ?? 0),
        cashOutflows: Number(data.cashOutflows ?? data.cashoutflows ?? 0),
        teacherPayroll: Number(data.teacherPayroll ?? data.teacherpayroll ?? 0),
        staffPayroll: Number(data.staffPayroll ?? data.staffpayroll ?? 0),
        otherExpenses: Number(data.otherExpenses ?? data.otherexpenses ?? 0),
        unpaidExpenses: Number(data.unpaidExpenses ?? data.unpaidexpenses ?? 0),
        scope: data.scope ?? '',
      } satisfies FinanceExpensesSummary))
    );
  }

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

export interface FinanceExpensesSummary {
  cashInflows: number; cashOutflows: number; teacherPayroll: number; staffPayroll: number; otherExpenses: number; unpaidExpenses: number; scope: string;
}

interface FinanceExpensesSummaryResponse extends Partial<FinanceExpensesSummary> {
  cashinflows?: number;
  cashoutflows?: number;
  teacherpayroll?: number;
  staffpayroll?: number;
  otherexpenses?: number;
  unpaidexpenses?: number;
}
