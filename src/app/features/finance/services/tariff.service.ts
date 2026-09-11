import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import { Tariff, TariffRequest } from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class TariffService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/tariffs`;
  search(schoolYearId: number | null, page = 0, size = 20) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (schoolYearId != null) p = p.set('schoolYearId', schoolYearId);
    return this.http.get<PageResponse<Tariff>>(this.url, { params: p });
  }
  create(r: TariffRequest) {
    return this.http.post<Tariff>(this.url, r);
  }
  update(id: number, r: TariffRequest) {
    return this.http.put<Tariff>(`${this.url}/${id}`, r);
  }
}
