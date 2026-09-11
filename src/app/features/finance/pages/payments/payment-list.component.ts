import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { GuardianChoice } from '../../models/finance-reference.model';
import { Payment } from '../../models/finance.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { PaymentService } from '../../services/payment.service';
@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent {
  private s = inject(PaymentService);
  private refs = inject(FinanceReferenceService);
  auth = inject(AuthService);
  items = signal<Payment[]>([]);
  guardians = signal<GuardianChoice[]>([]);
  selectedGuardian = signal<GuardianChoice | null>(null);
  page = signal(0);
  size = signal(20);
  total = signal(0);
  pages = signal(0);
  error = signal('');
  guardianSearch = '';
  constructor() {
    this.load();
  }
  load() {
    this.s
      .search(this.selectedGuardian()?.id ?? null, this.page(), this.size())
      .subscribe({
        next: (r) => {
          this.items.set(r.content);
          this.total.set(r.totalElements);
          this.pages.set(r.totalPages);
        },
        error: (e) => this.error.set(this.msg(e)),
      });
  }
  searchGuardians() {
    this.refs.guardians(this.guardianSearch, 0, 10).subscribe({
      next: (r) => this.guardians.set(r.content),
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  choose(g: GuardianChoice) {
    this.selectedGuardian.set(g);
    this.guardians.set([]);
    this.page.set(0);
    this.load();
  }
  clearGuardian() {
    this.selectedGuardian.set(null);
    this.page.set(0);
    this.load();
  }
  prev() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.load();
    }
  }
  next() {
    if (this.page() + 1 < this.pages()) {
      this.page.update((v) => v + 1);
      this.load();
    }
  }
  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
