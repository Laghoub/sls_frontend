import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  PaymentMethod,
  PaymentMethodRequest,
} from '../../models/finance.model';
import { PaymentMethodService } from '../../services/payment-method.service';
@Component({
  selector: 'app-finance-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-settings.component.html',
  styleUrl: './finance-settings.component.scss',
})
export class FinanceSettingsComponent {
  private s = inject(PaymentMethodService);
  auth = inject(AuthService);
  items = signal<PaymentMethod[]>([]);
  error = signal('');
  modal = signal(false);
  editing = signal<PaymentMethod | null>(null);
  form: PaymentMethodRequest = { code: '', name: '', active: true };
  constructor() {
    this.load();
  }
  load() {
    this.s.all().subscribe({
      next: (x) => this.items.set(x),
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  create() {
    this.editing.set(null);
    this.form = { code: '', name: '', active: true };
    this.modal.set(true);
  }
  edit(x: PaymentMethod) {
    this.editing.set(x);
    this.form = { code: x.code, name: x.name, active: x.active };
    this.modal.set(true);
  }
  save() {
    const op = this.editing()
      ? this.s.update(this.editing()!.id, this.form)
      : this.s.create(this.form);
    op.subscribe({
      next: () => {
        this.modal.set(false);
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
