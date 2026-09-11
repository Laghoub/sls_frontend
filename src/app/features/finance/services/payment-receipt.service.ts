import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { PaymentReceipt } from '../models/finance-tracking.model';

@Injectable({ providedIn: 'root' })
export class PaymentReceiptService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/finance/payment-receipts`;

  get(paymentId: number) {
    return this.http.get<PaymentReceipt>(`${this.url}/${paymentId}`);
  }
}
