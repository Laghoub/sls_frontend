import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  CashRegister,
  CashRegisterRequest,
  CashRegisterSession,
  CashSessionCloseRequest,
  CashSessionOpenRequest,
} from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/cash-registers`;

  all() {
    return this.http.get<CashRegister[]>(this.url);
  }

  create(r: CashRegisterRequest) {
    return this.http.post<CashRegister>(this.url, r);
  }

  update(id: number, r: CashRegisterRequest) {
    return this.http.put<CashRegister>(`${this.url}/${id}`, r);
  }

  currentSession() {
    return this.http.get<CashRegisterSession | null>(`${this.url}/sessions/current`);
  }

  history(id: number, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<CashRegisterSession>>(
      `${this.url}/${id}/sessions`,
      { params },
    );
  }

  openSession(r: CashSessionOpenRequest) {
    return this.http.post<CashRegisterSession>(`${this.url}/sessions/open`, r);
  }

  closeSession(id: number, r: CashSessionCloseRequest) {
    return this.http.post<CashRegisterSession>(
      `${this.url}/sessions/${id}/close`,
      r,
    );
  }
}
