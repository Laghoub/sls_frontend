import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  Payroll,
  PayrollCalculateRequest,
  PayrollPeriod,
  SalaryPaymentReceipt,
  SalaryPaymentRequest,
} from '../models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);
  private readonly root = `${API_CONFIG.baseUrl}/payroll/teachers`;

  calculate(request: PayrollCalculateRequest) {
    return this.http.post<Payroll>(`${this.root}/calculate`, request);
  }

  get(id: number) {
    return this.http.get<Payroll>(`${this.root}/${id}`);
  }

  list(periodId: number) {
    return this.http.get<Payroll[]>(this.root, {
      params: new HttpParams().set('periodId', periodId),
    });
  }

  periods() {
    return this.http.get<PayrollPeriod[]>(`${this.root}/periods`);
  }

  pay(payrollId: number, request: SalaryPaymentRequest) {
    return this.http.post<SalaryPaymentReceipt>(
      `${this.root}/${payrollId}/payments`,
      request,
    );
  }

  receipt(paymentId: number) {
    return this.http.get<SalaryPaymentReceipt>(
      `${this.root}/payments/${paymentId}/receipt`,
    );
  }
}
