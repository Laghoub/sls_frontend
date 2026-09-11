import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import { FeeType, FeeTypeRequest } from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class FeeTypeService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/fee-types`;
  search(search = '', page = 0, size = 20) {
    const p = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<FeeType>>(this.url, { params: p });
  }
  create(r: FeeTypeRequest) {
    return this.http.post<FeeType>(this.url, r);
  }
  update(id: number, r: FeeTypeRequest) {
    return this.http.put<FeeType>(`${this.url}/${id}`, r);
  }
}
