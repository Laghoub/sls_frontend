import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  GuardianChoice,
  RegistrationChoice,
} from '../../models/finance-reference.model';
import {
  PaymentAllocationRequest,
  PaymentCreateRequest,
  PaymentMethod,
  StudentCharge,
} from '../../models/finance.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentService } from '../../services/payment.service';
import { StudentChargeService } from '../../services/student-charge.service';
import { FinanceSessionStateService } from '../../services/finance-session-state.service';
@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss',
})
export class PaymentCreateComponent {
  private refs = inject(FinanceReferenceService);
  private methodsService = inject(PaymentMethodService);
  private chargesService = inject(StudentChargeService);
  private payments = inject(PaymentService);
  private router = inject(Router);
  cashState = inject(FinanceSessionStateService);
  guardians = signal<GuardianChoice[]>([]);
  registrations = signal<RegistrationChoice[]>([]);
  charges = signal<StudentCharge[]>([]);
  methods = signal<PaymentMethod[]>([]);
  guardian = signal<GuardianChoice | null>(null);
  registration = signal<RegistrationChoice | null>(null);
  error = signal('');
  saving = signal(false);
  guardianSearch = '';
  registrationSearch = '';
  externalReference = '';
  notes = '';
  totalAmount = 0;
  paymentMethodId: number | null = null;
  allocationAmounts: Record<number, number> = {};
  constructor() {
    this.methodsService.all().subscribe({
      next: (x) => {
        this.methods.set(x.filter((m) => m.active));
        this.paymentMethodId = this.methods()[0]?.id ?? null;
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
  chooseGuardian(g: GuardianChoice) {
    this.guardian.set(g);
    this.guardians.set([]);
    this.registration.set(null);
    this.charges.set([]);
    this.registrationSearch = '';
  }
  searchRegistrations() {
    this.refs
      .registrations(
        this.registrationSearch,
        null,
        'EN_ATTENTE_PAIEMENT',
        0,
        10,
      )
      .subscribe({
        next: (r) =>
          this.registrations.set(
            r.content.filter(
              (x) => !this.guardian() || x.guardianId === this.guardian()!.id,
            ),
          ),
        error: (e) => this.error.set(this.msg(e)),
      });
  }
  chooseRegistration(r: RegistrationChoice) {
    this.registration.set(r);
    this.registrations.set([]);
    this.chargesService.search(r.id, null, 0, 100).subscribe({
      next: (p) => {
        const payable = p.content.filter(
          (c) =>
            c.status !== 'PAID' &&
            c.status !== 'CANCELLED' &&
            c.remainingAmount > 0,
        );
        this.charges.set(payable);
        this.allocationAmounts = {};
        for (const c of payable)
          this.allocationAmounts[c.id] = c.remainingAmount;
        this.recomputeTotal();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  recomputeTotal() {
    this.totalAmount = Object.values(this.allocationAmounts).reduce(
      (a, b) => a + (Number(b) || 0),
      0,
    );
  }
  create() {
    if (!this.guardian() || !this.paymentMethodId || this.totalAmount <= 0) {
      this.error.set(
        'Responsable, mode de paiement et montant sont obligatoires.',
      );
      return;
    }
    const allocations: PaymentAllocationRequest[] = this.charges()
      .map((c) => ({
        studentChargeId: c.id,
        amount: Number(this.allocationAmounts[c.id] || 0),
      }))
      .filter((a) => a.amount > 0);
    const r: PaymentCreateRequest = {
      guardianId: this.guardian()!.id,
      paymentDate: null,
      paymentMethodId: this.paymentMethodId,
      totalAmount: Number(this.totalAmount),
      cashRegisterSessionId:
        this.cashState.current()?.status === 'OPEN'
          ? this.cashState.current()!.id
          : null,
      externalReference: this.blank(this.externalReference),
      notes: this.blank(this.notes),
      allocations,
    };
    this.saving.set(true);
    this.payments.create(r).subscribe({
      next: (d) => this.router.navigate(['/finance/payments', d.payment.id]),
      error: (e) => {
        this.error.set(this.msg(e));
        this.saving.set(false);
      },
    });
  }
  blank(v: string) {
    const x = v.trim();
    return x ? x : null;
  }
  msg(e: any) {
    return e?.error?.message ?? 'Impossible d’enregistrer le paiement.';
  }
}
