import { Injectable, signal } from '@angular/core';
import { CashRegisterSession } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceSessionStateService {
  private readonly key = 'finance.currentCashSession';
  readonly current = signal<CashRegisterSession | null>(this.read());

  set(session: CashRegisterSession) {
    this.current.set(session);
    sessionStorage.setItem(this.key, JSON.stringify(session));
  }

  clear() {
    this.current.set(null);
    sessionStorage.removeItem(this.key);
  }

  private read(): CashRegisterSession | null {
    try {
      const raw = sessionStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as CashRegisterSession) : null;
    } catch {
      return null;
    }
  }
}
