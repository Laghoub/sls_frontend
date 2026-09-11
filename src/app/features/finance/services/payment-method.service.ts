import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PaymentMethod, PaymentMethodRequest } from '../models/finance.model';
@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/payment-methods`;
  all() {
    return this.http.get<PaymentMethod[]>(this.url);
  }
  create(r: PaymentMethodRequest) {
    return this.http.post<PaymentMethod>(this.url, r);
  }
  update(id: number, r: PaymentMethodRequest) {
    return this.http.put<PaymentMethod>(`${this.url}/${id}`, r);
  }
}
