import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';

import { GuardianChoice } from '../../models/finance-reference.model';
import {
  GuardianStudentChoice,
  StudentOpenCharge,
} from '../../models/finance-collection.model';
import {
  AutomaticAllocationResponse,
} from '../../models/automatic-allocation.model';
import {
  PaymentAllocationRequest,
  PaymentCreateRequest,
  PaymentMethod,
} from '../../models/finance.model';
import { FinanceCollectionService } from '../../services/finance-collection.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceSessionStateService } from '../../services/finance-session-state.service';
import { CashRegisterService } from '../../services/cash-register.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss',
})
export class PaymentCreateComponent {
  private refs = inject(FinanceReferenceService);
  private collection = inject(FinanceCollectionService);
  private methodsService = inject(PaymentMethodService);
  private payments = inject(PaymentService);
  private cashRegisters = inject(CashRegisterService);
  private router = inject(Router);

  cashState = inject(FinanceSessionStateService);

  guardians = signal<GuardianChoice[]>([]);
  students = signal<GuardianStudentChoice[]>([]);
  charges = signal<StudentOpenCharge[]>([]);
  methods = signal<PaymentMethod[]>([]);
  guardian = signal<GuardianChoice | null>(null);

  loadingStudents = signal(false);
  loadingCharges = signal(false);
  allocating = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  allocationPreview = signal<AutomaticAllocationResponse | null>(null);

  guardianSearch = '';
  externalReference = '';
  notes = '';
  totalAmount = 0;
  paymentMethodId: number | null = null;
  allocationMode: 'AUTO' | 'MANUAL' = 'AUTO';

  /** Montant final affecté à chaque créance, modifiable avant validation. */
  allocationAmounts: Record<number, number> = {};

  constructor() {
    this.methodsService.all().subscribe({
      next: (x) => {
        this.methods.set(x.filter((m) => m.active));
        this.paymentMethodId = this.methods()[0]?.id ?? null;
      },
      error: (e) => this.error.set(this.msg(e)),
    });

    this.cashRegisters.currentSession().subscribe({
      next: (session) => session?.status === 'OPEN' ? this.cashState.set(session) : this.cashState.clear(),
      error: () => this.cashState.clear(),
    });
  }

  searchGuardians(): void {
    this.error.set('');
    this.refs.guardians(this.guardianSearch, 0, 10).subscribe({
      next: (r) => this.guardians.set(r.content),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  chooseGuardian(g: GuardianChoice): void {
    this.guardian.set(g);
    this.guardians.set([]);
    this.students.set([]);
    this.charges.set([]);
    this.allocationAmounts = {};
    this.allocationPreview.set(null);
    this.totalAmount = 0;
    this.success.set('');
    this.loadFamily(g.id);
  }

  loadFamily(guardianId: number): void {
    this.loadingStudents.set(true);
    this.loadingCharges.set(true);
    this.error.set('');

    this.collection.students(guardianId).subscribe({
      next: (students) => {
        this.students.set(students);
        this.loadingStudents.set(false);

        if (!students.length) {
          this.charges.set([]);
          this.loadingCharges.set(false);
          return;
        }

        const requests = students.map((student) =>
          this.collection.openCharges(
            guardianId,
            student.studentId,
            student.schoolYearId,
          ),
        );

        (requests.length ? forkJoin(requests) : of([])).subscribe({
          next: (groups) => {
            const all = (groups as StudentOpenCharge[][])
              .flat()
              .sort((a, b) => this.chargeSortKey(a).localeCompare(this.chargeSortKey(b)));

            this.charges.set(all);
            this.allocationAmounts = {};
            for (const charge of all) {
              this.allocationAmounts[charge.chargeId] = 0;
            }
            this.loadingCharges.set(false);
          },
          error: (e) => {
            this.loadingCharges.set(false);
            this.error.set(this.msg(e));
          },
        });
      },
      error: (e) => {
        this.loadingStudents.set(false);
        this.loadingCharges.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  ventilerAutomatiquement(): void {
    const g = this.guardian();
    const amount = Number(this.totalAmount);

    if (!g) {
      this.error.set('Sélectionnez d’abord un responsable.');
      return;
    }
    if (amount <= 0) {
      this.error.set('Saisissez d’abord le montant remis par le parent.');
      return;
    }

    this.error.set('');
    this.success.set('');
    this.allocating.set(true);

    this.collection.automaticAllocationPreview({
      guardianId: g.id,
      schoolYearId: null,
      amount,
    }).subscribe({
      next: (preview) => {
        this.allocationPreview.set(preview);
        for (const charge of this.charges()) {
          this.allocationAmounts[charge.chargeId] = 0;
        }
        for (const line of preview.allocations) {
          this.allocationAmounts[line.studentChargeId] = Number(line.allocatedAmount);
        }
        this.allocationMode = 'AUTO';
        this.allocating.set(false);
        this.success.set(
          `${preview.affectedCharges} créance(s) ventilée(s) automatiquement. Vous pouvez ajuster les montants avant validation.`,
        );
      },
      error: (e) => {
        this.allocating.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  useManualMode(): void {
    this.allocationMode = 'MANUAL';
    this.success.set('Mode manuel activé : vous pouvez modifier librement la proposition avant validation.');
  }

  resetAllocation(): void {
    for (const charge of this.charges()) {
      this.allocationAmounts[charge.chargeId] = 0;
    }
    this.allocationPreview.set(null);
    this.success.set('');
  }

  setFull(charge: StudentOpenCharge): void {
    this.allocationMode = 'MANUAL';
    this.allocationAmounts[charge.chargeId] = Number(charge.remainingAmount);
  }

  clearCharge(charge: StudentOpenCharge): void {
    this.allocationMode = 'MANUAL';
    this.allocationAmounts[charge.chargeId] = 0;
  }

  onAllocationChange(charge: StudentOpenCharge): void {
    this.allocationMode = 'MANUAL';
    let value = Number(this.allocationAmounts[charge.chargeId] || 0);
    if (value < 0) value = 0;
    if (value > Number(charge.remainingAmount)) value = Number(charge.remainingAmount);
    this.allocationAmounts[charge.chargeId] = value;
  }

  allocatedTotal(): number {
    return this.charges().reduce(
      (sum, c) => sum + (Number(this.allocationAmounts[c.chargeId]) || 0),
      0,
    );
  }

  unallocatedTotal(): number {
    return Math.max(0, Number(this.totalAmount || 0) - this.allocatedTotal());
  }

  outstandingTotal(): number {
    return this.charges().reduce(
      (sum, c) => sum + Number(c.remainingAmount || 0),
      0,
    );
  }

  selectedChargesCount(): number {
    return this.charges().filter(
      (c) => Number(this.allocationAmounts[c.chargeId] || 0) > 0,
    ).length;
  }

  studentName(studentId: number): string {
    const s = this.students().find((x) => x.studentId === studentId);
    return s ? `${s.lastName} ${s.firstName}` : `Élève #${studentId}`;
  }

  studentMeta(studentId: number): string {
    const s = this.students().find((x) => x.studentId === studentId);
    if (!s) return '';
    return [s.studentNumber, s.classGroupName, s.levelName].filter(Boolean).join(' · ');
  }

  periodLabel(c: StudentOpenCharge): string {
    const raw = c.billingPeriodStart || c.dueDate;
    if (!raw) return '—';
    const d = new Date(`${raw}T00:00:00`);
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  private chargeSortKey(c: StudentOpenCharge): string {
    const period = c.billingPeriodStart || c.dueDate || '9999-12-31';
    return `${period}-${String(c.studentId).padStart(12, '0')}-${String(c.chargeId).padStart(12, '0')}`;
  }

  selectedPaymentMethod(): PaymentMethod | null {
    return this.methods().find((m) => m.id === this.paymentMethodId) ?? null;
  }

  requiresCashSession(): boolean {
    const code = this.selectedPaymentMethod()?.code?.trim().toUpperCase();
    return !!code && code !== 'VIREMENT';
  }

  canValidatePayment(): boolean {
    if (this.saving() || !this.guardian() || this.allocatedTotal() <= 0 || this.totalAmount < this.allocatedTotal()) return false;
    if (this.requiresCashSession() && this.cashState.current()?.status !== 'OPEN') return false;
    return true;
  }

  create(): void {
    const g = this.guardian();
    if (!g || !this.paymentMethodId) {
      this.error.set('Responsable et mode de paiement sont obligatoires.');
      return;
    }

    if (this.requiresCashSession() && this.cashState.current()?.status !== 'OPEN') {
      this.error.set('Une session de caisse ouverte est obligatoire pour ce mode de paiement. Seul le virement peut être enregistré sans session de caisse.');
      return;
    }

    const allocations: PaymentAllocationRequest[] = this.charges()
      .map((c) => ({
        studentChargeId: c.chargeId,
        amount: Number(this.allocationAmounts[c.chargeId] || 0),
      }))
      .filter((a) => a.amount > 0);

    if (!allocations.length) {
      this.error.set('Ventilez le paiement sur au moins une créance.');
      return;
    }

    for (const c of this.charges()) {
      const amount = Number(this.allocationAmounts[c.chargeId] || 0);
      if (amount < 0 || amount > Number(c.remainingAmount)) {
        this.error.set(`La ventilation de « ${c.label} » est invalide.`);
        return;
      }
    }

    const allocated = this.allocatedTotal();
    const total = Number(this.totalAmount);
    if (total <= 0) {
      this.error.set('Le montant encaissé doit être supérieur à zéro.');
      return;
    }
    if (total < allocated) {
      this.error.set('Le montant encaissé ne peut pas être inférieur au montant ventilé.');
      return;
    }

    const request: PaymentCreateRequest = {
      guardianId: g.id,
      paymentDate: null,
      paymentMethodId: this.paymentMethodId,
      totalAmount: total,
      cashRegisterSessionId:
        this.cashState.current()?.status === 'OPEN'
          ? this.cashState.current()!.id
          : null,
      externalReference: this.blank(this.externalReference),
      notes: this.blank(this.notes),
      allocations,
    };

    this.error.set('');
    this.saving.set(true);

    this.payments.create(request).subscribe({
      next: (detail) => this.router.navigate(['/finance/payments', detail.payment.id]),
      error: (e) => {
        this.error.set(this.msg(e));
        this.saving.set(false);
      },
    });
  }

  blank(v: string): string | null {
    const x = v.trim();
    return x ? x : null;
  }

  msg(e: any): string {
    return e?.error?.message ?? 'Impossible d’enregistrer le paiement.';
  }
}
