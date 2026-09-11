import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  RegistrationChoice,
  SchoolYearRef,
} from '../../models/finance-reference.model';
import {
  FeeType,
  StudentCharge,
  StudentChargeCreateRequest,
} from '../../models/finance.model';
import { FeeTypeService } from '../../services/fee-type.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { StudentChargeService } from '../../services/student-charge.service';
@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.scss',
})
export class ChargesComponent {
  private s = inject(StudentChargeService);
  private refs = inject(FinanceReferenceService);
  private fees = inject(FeeTypeService);
  auth = inject(AuthService);
  items = signal<StudentCharge[]>([]);
  feeTypes = signal<FeeType[]>([]);
  registrations = signal<RegistrationChoice[]>([]);
  years = signal<SchoolYearRef[]>([]);
  selectedRegistration = signal<RegistrationChoice | null>(null);
  page = signal(0);
  size = signal(20);
  total = signal(0);
  pages = signal(0);
  error = signal('');
  modal = signal(false);
  cancelId = signal<number | null>(null);
  cancelReason = '';
  registrationCaseId: number | null = null;
  registrationSearch = '';
  form: StudentChargeCreateRequest = {
    studentEnrollmentId: null,
    registrationCaseId: null,
    feeTypeId: 0,
    tariffId: null,
    label: 'Frais d’inscription',
    originalAmount: 0,
    discountAmount: 0,
    dueDate: null,
    billingPeriodStart: null,
    billingPeriodEnd: null,
  };
  constructor() {
    this.refs.schoolYears().subscribe((y) => this.years.set(y));
    this.fees.search('', 0, 100).subscribe((r) => this.feeTypes.set(r.content));
    this.load();
  }
  load() {
    this.s
      .search(this.registrationCaseId, null, this.page(), this.size())
      .subscribe({
        next: (r) => {
          this.items.set(r.content);
          this.total.set(r.totalElements);
          this.pages.set(r.totalPages);
        },
        error: (e) => this.error.set(this.msg(e)),
      });
  }
  searchRegistrations() {
    this.refs
      .registrations(this.registrationSearch, null, null, 0, 10)
      .subscribe({
        next: (r) => this.registrations.set(r.content),
        error: (e) => this.error.set(this.msg(e)),
      });
  }
  chooseRegistration(r: RegistrationChoice) {
    this.selectedRegistration.set(r);
    this.registrationCaseId = r.id;
    this.page.set(0);
    this.load();
    this.registrations.set([]);
  }
  openCreate() {
    this.form = {
      studentEnrollmentId: null,
      registrationCaseId:
        this.selectedRegistration()?.id ?? this.registrationCaseId,
      feeTypeId: this.feeTypes()[0]?.id ?? 0,
      tariffId: null,
      label: 'Frais d’inscription',
      originalAmount: 0,
      discountAmount: 0,
      dueDate: null,
      billingPeriodStart: null,
      billingPeriodEnd: null,
    };
    this.modal.set(true);
  }
  save() {
    this.s.create(this.form).subscribe({
      next: () => {
        this.modal.set(false);
        this.registrationCaseId = this.form.registrationCaseId;
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  askCancel(id: number) {
    this.cancelId.set(id);
    this.cancelReason = '';
  }
  confirmCancel() {
    if (!this.cancelId() || !this.cancelReason.trim()) return;
    this.s.cancel(this.cancelId()!, this.cancelReason.trim()).subscribe({
      next: () => {
        this.cancelId.set(null);
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  fee(id: number) {
    return this.feeTypes().find((f) => f.id === id)?.name ?? `Frais ${id}`;
  }
  status(s: string) {
    return s.replaceAll('_', ' ');
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
