import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  FamilyFinancialSituation,
  FinanceDashboard,
  InstallmentGenerationRequest,
  InstallmentGenerationResponse,
  OverdueCharge,
  StudentFinancialSituation,
} from '../models/finance-tracking.model';

@Injectable({ providedIn: 'root' })
export class FinanceTrackingService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/tracking`;

  student(studentId: number, schoolYearId: number) {
    const params = new HttpParams().set('schoolYearId', schoolYearId);
    return this.http.get<StudentFinancialSituation>(
      `${this.url}/students/${studentId}`,
      { params },
    );
  }

  family(guardianId: number, schoolYearId: number) {
    const params = new HttpParams().set('schoolYearId', schoolYearId);
    return this.http.get<FamilyFinancialSituation>(
      `${this.url}/families/${guardianId}`,
      { params },
    );
  }

  overdue(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<OverdueCharge>>(`${this.url}/overdue`, {
      params,
    });
  }

  dashboard(schoolYearId: number) {
    const params = new HttpParams().set('schoolYearId', schoolYearId);
    return this.http.get<FinanceDashboard>(`${this.url}/dashboard`, { params });
  }

  generateInstallments(
    enrollmentId: number,
    request: InstallmentGenerationRequest,
  ) {
    return this.http.post<InstallmentGenerationResponse>(
      `${this.url}/enrollments/${enrollmentId}/generate-installments`,
      request,
    );
  }
}
