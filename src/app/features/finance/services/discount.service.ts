import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  DiscountApplicationResponse,
  DiscountRejectRequest,
  StudentDiscount,
  StudentDiscountRequest,
} from '../models/discount.model';

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/discounts`;

  search(status: string | null, enrollmentId: number | null, page = 0, size = 20) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (enrollmentId != null) params = params.set('enrollmentId', enrollmentId);
    return this.http.get<PageResponse<StudentDiscount>>(this.url, { params });
  }

  create(request: StudentDiscountRequest) {
    return this.http.post<StudentDiscount>(this.url, request);
  }

  approve(id: number) {
    return this.http.post<StudentDiscount>(`${this.url}/${id}/approve`, {});
  }

  reject(id: number, request: DiscountRejectRequest) {
    return this.http.post<StudentDiscount>(`${this.url}/${id}/reject`, request);
  }

  reapplyEnrollment(enrollmentId: number) {
    return this.http.post<DiscountApplicationResponse>(
      `${this.url}/enrollments/${enrollmentId}/reapply`,
      {},
    );
  }
}
