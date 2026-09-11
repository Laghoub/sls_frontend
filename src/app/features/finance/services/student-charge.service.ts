import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  StudentCharge,
  StudentChargeCreateRequest,
} from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class StudentChargeService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/charges`;
  search(
    registrationCaseId: number | null,
    studentEnrollmentId: number | null,
    page = 0,
    size = 20,
  ) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (registrationCaseId != null)
      p = p.set('registrationCaseId', registrationCaseId);
    if (studentEnrollmentId != null)
      p = p.set('studentEnrollmentId', studentEnrollmentId);
    return this.http.get<PageResponse<StudentCharge>>(this.url, { params: p });
  }
  create(r: StudentChargeCreateRequest) {
    return this.http.post<StudentCharge>(this.url, r);
  }
  cancel(id: number, reason: string) {
    return this.http.post<StudentCharge>(`${this.url}/${id}/cancel`, {
      reason,
    });
  }
}
