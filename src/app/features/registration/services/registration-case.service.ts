import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  RegistrationCase,
  RegistrationCaseCreateRequest,
  RegistrationCaseDetail,
  RegistrationCaseUpdateRequest,
  RegistrationStatus,
  RegistrationValidation,
  StudentEnrollmentCreateRequest,
} from '../models/registration.model';
@Injectable({ providedIn: 'root' })
export class RegistrationCaseService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/registrations`;
  search(
    page = 0,
    size = 20,
    search = '',
    schoolYearId?: number | null,
    status?: RegistrationStatus | null,
  ) {
    let p = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search);
    if (schoolYearId) p = p.set('schoolYearId', schoolYearId);
    if (status) p = p.set('status', status);
    return this.http.get<PageResponse<RegistrationCase>>(this.url, {
      params: p,
    });
  }
  getById(id: number) {
    return this.http.get<RegistrationCaseDetail>(`${this.url}/${id}`);
  }
  create(r: RegistrationCaseCreateRequest) {
    return this.http.post<RegistrationCase>(this.url, r);
  }
  update(id: number, r: RegistrationCaseUpdateRequest) {
    return this.http.put<RegistrationCase>(`${this.url}/${id}`, r);
  }
  submitPayment(id: number) {
    return this.http.post<RegistrationCase>(
      `${this.url}/${id}/submit-payment`,
      {},
    );
  }
  paymentConfirmed(id: number) {
    return this.http.post<RegistrationCase>(
      `${this.url}/${id}/payment-confirmed`,
      {},
    );
  }
  startCompletion(id: number) {
    return this.http.post<RegistrationCase>(
      `${this.url}/${id}/start-completion`,
      {},
    );
  }
  markIncomplete(id: number) {
    return this.http.post<RegistrationCase>(
      `${this.url}/${id}/mark-incomplete`,
      {},
    );
  }
  validation(id: number) {
    return this.http.get<RegistrationValidation>(
      `${this.url}/${id}/validation`,
    );
  }
  finalize(id: number, r: StudentEnrollmentCreateRequest) {
    return this.http.post<RegistrationCaseDetail>(
      `${this.url}/${id}/finalize`,
      r,
    );
  }
  cancel(id: number, reason: string) {
    return this.http.post<RegistrationCase>(`${this.url}/${id}/cancel`, {
      reason,
    });
  }
}
