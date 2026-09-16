import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { HrService } from '../../../hr/services/hr.service';
import { Teacher } from '../../../hr/models/hr.model';
import { FinanceReferenceService } from '../../../finance/services/finance-reference.service';
import { SchoolYearRef } from '../../../finance/models/finance-reference.model';
import { PaymentMethod, CashRegisterSession } from '../../../finance/models/finance.model';
import { PaymentMethodService } from '../../../finance/services/payment-method.service';
import { CashRegisterService } from '../../../finance/services/cash-register.service';
import { Payroll, PayrollPeriod, SalaryPaymentReceipt } from '../../models/payroll.model';
import { PayrollService } from '../../services/payroll.service';

@Component({
  selector: 'app-teacher-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-payroll.component.html',
  styleUrl: './teacher-payroll.component.scss',
})
export class TeacherPayrollComponent {
  private readonly payroll = inject(PayrollService);
  private readonly hr = inject(HrService);
  private readonly refs = inject(FinanceReferenceService);
  private readonly paymentMethodsService = inject(PaymentMethodService);
  private readonly cashService = inject(CashRegisterService);
  readonly auth = inject(AuthService);

  teachers: Teacher[] = [];
  schoolYears: SchoolYearRef[] = [];
  periods: PayrollPeriod[] = [];
  items: Payroll[] = [];
  paymentMethods: PaymentMethod[] = [];
  currentCashSession: CashRegisterSession | null = null;

  selectedSchoolYearId: number | null = null;
  selectedTeacherId: number | null = null;
  selectedPeriodId: number | null = null;
  calcYear = new Date().getFullYear();
  calcMonth = new Date().getMonth() + 1;
  absenceDeduction: number | null = null;

  selectedPayroll: Payroll | null = null;
  receipt: SalaryPaymentReceipt | null = null;

  loading = false;
  calculating = false;
  paying = false;
  error = '';
  success = '';

  paymentModal = false;
  receiptModal = false;
  paymentAmount: number | null = null;
  paymentMethodId: number | null = null;
  paymentReference = '';

  readonly months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' },
  ];

  constructor() {
    this.loadReferences();
  }

  loadReferences(): void {
    this.error = '';
    this.refs.schoolYears().subscribe({
      next: (years) => {
        this.schoolYears = years;
        const current = years.find((y) => y.currentYear) ?? years[0];
        if (current) {
          this.selectedSchoolYearId = current.id;
          const date = new Date();
          const within = date >= new Date(current.startDate) && date <= new Date(current.endDate);
          if (!within) {
            this.calcYear = new Date(current.startDate).getFullYear();
            this.calcMonth = new Date(current.startDate).getMonth() + 1;
          }
        }
      },
      error: (e) => this.error = this.msg(e),
    });
    this.hr.teachers().subscribe({
      next: (x) => this.teachers = x.filter((t) => t.status === 'ACTIVE'),
      error: (e) => this.error = this.msg(e),
    });
    this.paymentMethodsService.all().subscribe({
      next: (x) => this.paymentMethods = x.filter((m) => m.active),
      error: (e) => this.error = this.msg(e),
    });
    this.cashService.currentSession().subscribe({
      next: (x) => this.currentCashSession = x,
      error: () => this.currentCashSession = null,
    });
    this.refreshPeriods();
  }

  refreshPeriods(selectId?: number): void {
    this.payroll.periods().subscribe({
      next: (x) => {
        this.periods = x;
        if (selectId != null) this.selectedPeriodId = selectId;
        if (this.selectedPeriodId && this.periods.some((p) => p.id === this.selectedPeriodId)) {
          this.loadPeriod();
        }
      },
      error: (e) => this.error = this.msg(e),
    });
  }

  calculate(): void {
    if (!this.selectedTeacherId || !this.selectedSchoolYearId) {
      this.error = 'Sélectionnez une année scolaire et un enseignant.';
      return;
    }
    this.error = '';
    this.success = '';
    this.calculating = true;
    this.payroll.calculate({
      teacherId: this.selectedTeacherId,
      schoolYearId: this.selectedSchoolYearId,
      year: this.calcYear,
      month: this.calcMonth,
      absenceDeduction: this.absenceDeduction && this.absenceDeduction > 0 ? this.absenceDeduction : null,
    }).subscribe({
      next: (p) => {
        this.calculating = false;
        this.selectedPayroll = p;
        this.success = `Paie calculée pour ${p.teacherName}. Version ${p.versionNumber}.`;
        this.refreshPeriods(p.payrollPeriodId);
      },
      error: (e) => {
        this.calculating = false;
        this.error = this.msg(e);
      },
    });
  }

  loadPeriod(): void {
    if (!this.selectedPeriodId) {
      this.items = [];
      return;
    }
    this.loading = true;
    this.error = '';
    this.payroll.list(this.selectedPeriodId).subscribe({
      next: (x) => {
        this.items = x;
        this.loading = false;
        if (this.selectedPayroll) {
          const updated = x.find((p) => p.id === this.selectedPayroll?.id);
          if (updated) this.selectedPayroll = { ...this.selectedPayroll, ...updated };
        }
      },
      error: (e) => {
        this.loading = false;
        this.error = this.msg(e);
      },
    });
  }

  openDetail(row: Payroll): void {
    this.error = '';
    this.payroll.get(row.id).subscribe({
      next: (x) => this.selectedPayroll = x,
      error: (e) => this.error = this.msg(e),
    });
  }

  openPayment(row?: Payroll): void {
    const p = row ?? this.selectedPayroll;
    if (!p || p.remainingAmount <= 0) return;
    this.selectedPayroll = p;
    this.paymentAmount = p.remainingAmount;
    this.paymentReference = '';
    this.paymentMethodId = this.paymentMethods[0]?.id ?? null;
    this.paymentModal = true;
    this.error = '';
  }

  closePayment(): void {
    if (!this.paying) this.paymentModal = false;
  }

  isCashSelected(): boolean {
    const m = this.paymentMethods.find((x) => x.id === this.paymentMethodId);
    return !!m && ['ESPECES', 'CASH'].includes((m.code || '').toUpperCase());
  }

  submitPayment(): void {
    if (!this.selectedPayroll || !this.paymentMethodId || !this.paymentAmount || this.paymentAmount <= 0) {
      this.error = 'Renseignez un montant et un mode de paiement.';
      return;
    }
    if (this.paymentAmount > this.selectedPayroll.remainingAmount) {
      this.error = 'Le montant dépasse le reste à payer.';
      return;
    }
    if (this.isCashSelected() && !this.currentCashSession) {
      this.error = 'Aucune session de caisse ouverte. Ouvrez une caisse avant un paiement en espèces.';
      return;
    }
    this.paying = true;
    this.error = '';
    this.payroll.pay(this.selectedPayroll.id, {
      amount: this.paymentAmount,
      paymentMethodId: this.paymentMethodId,
      cashRegisterSessionId: this.isCashSelected() ? this.currentCashSession?.id ?? null : null,
      reference: this.paymentReference?.trim() || null,
    }).subscribe({
      next: (r) => {
        this.paying = false;
        this.paymentModal = false;
        this.receipt = r;
        this.receiptModal = true;
        this.success = `Paiement enregistré. Reçu ${r.receiptNumber} généré et notification e-mail mise en file d'envoi.`;
        this.loadPeriod();
        if (this.selectedPayroll) this.openDetail(this.selectedPayroll);
      },
      error: (e) => {
        this.paying = false;
        this.error = this.msg(e);
      },
    });
  }

  closeReceipt(): void {
    this.receiptModal = false;
  }

  printReceipt(): void {
    if (!this.receipt) return;
    const r = this.receipt;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${this.escape(r.receiptNumber)}</title><style>
      @page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#0f2742;margin:0}.head{display:flex;align-items:center;border-bottom:2px solid #0f2742;padding-bottom:12px}.logo{width:70px;height:70px;object-fit:contain;margin-right:14px}.brand h1{font-size:18px;margin:0}.brand p{font-size:12px;color:#64748b;margin:4px 0}.receipt-no{margin-left:auto;text-align:right}.receipt-no b{display:block;font-size:16px}.title{text-align:center;margin:26px 0 18px;font-size:22px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px}.item span{font-size:10px;color:#64748b;text-transform:uppercase;font-weight:bold;display:block;margin-bottom:4px}.item b{font-size:13px}.box{margin-top:22px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px}.line{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:13px}.line:last-child{border:0;font-size:16px;font-weight:bold}.footer{margin-top:35px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#64748b;text-align:center}.signature{display:flex;justify-content:space-between;margin-top:45px;font-size:12px}.signature div{width:38%;text-align:center;border-top:1px solid #64748b;padding-top:8px}</style></head><body>
      <div class="head"><img class="logo" src="${location.origin}/assets/logo.png"><div class="brand"><h1>Groupe Scolaire Sciences et Lettres</h1><p>Reçu de paiement de salaire</p></div><div class="receipt-no"><span>Reçu</span><b>${this.escape(r.receiptNumber)}</b></div></div>
      <div class="title">Reçu de rémunération enseignant</div>
      <div class="grid"><div class="item"><span>Enseignant</span><b>${this.escape(r.teacherName)}</b></div><div class="item"><span>Matricule</span><b>${this.escape(r.employeeNumber)}</b></div><div class="item"><span>Période</span><b>${this.monthName(r.month)} ${r.year}</b></div><div class="item"><span>Type</span><b>${this.compensationLabel(r.compensationType)}</b></div><div class="item"><span>Mode de paiement</span><b>${this.escape(r.paymentMethod)}</b></div><div class="item"><span>Référence</span><b>${this.escape(r.paymentReference || '—')}</b></div><div class="item"><span>Date de paiement</span><b>${this.formatDateTime(r.paymentDate)}</b></div><div class="item"><span>Bulletin</span><b>${this.escape(r.payslipNumber || '—')}</b></div></div>
      <div class="box"><div class="line"><span>Salaire de base</span><b>${this.money(r.baseSalary)} DA</b></div><div class="line"><span>Part fixe</span><b>${this.money(r.fixedPart)} DA</b></div><div class="line"><span>Heures rémunérées</span><b>${this.num(r.regularHours)} h</b></div><div class="line"><span>Part horaire</span><b>${this.money(r.hourlyAmount)} DA</b></div><div class="line"><span>Retenue absence</span><b>${this.money(r.absenceDeduction)} DA</b></div><div class="line"><span>Net calculé</span><b>${this.money(r.netSalary)} DA</b></div><div class="line"><span>Montant versé</span><b>${this.money(r.paymentAmount)} DA</b></div><div class="line"><span>Total déjà versé</span><b>${this.money(r.totalPaid)} DA</b></div><div class="line"><span>Reste à payer</span><b>${this.money(r.remainingAmount)} DA</b></div></div>
      <div class="signature"><div>Signature du bénéficiaire</div><div>Cachet / signature établissement</div></div><div class="footer">Document généré par le système de gestion scolaire — Groupe Scolaire Sciences et Lettres</div>
      <script>window.onload=()=>{setTimeout(()=>window.print(),250)};<\/script></body></html>`;
    this.printHtml(html);
  }

  printPayslip(): void {
    const p = this.selectedPayroll;
    if (!p) return;
    const attendanceRows = (p.attendanceLines || []).map((x) => `<tr><td>${this.formatDate(x.date)}</td><td>${this.escape(x.className)}</td><td>${this.escape(x.subjectName)}</td><td>${this.escape(x.timeRange)}</td><td>${this.attendanceLabel(x.attendanceStatus)}</td><td>${x.paidMinutes} min</td><td>${this.money(x.appliedHourlyRate)} DA/h</td><td>${this.money(x.amount)} DA</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bulletin ${this.escape(p.teacherName)}</title><style>@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#0f2742}.head{display:flex;align-items:center;border-bottom:2px solid #0f2742;padding-bottom:10px}.logo{width:62px;height:62px;object-fit:contain;margin-right:12px}.brand h1{font-size:17px;margin:0}.brand p{font-size:11px;color:#64748b;margin:3px 0}.title{text-align:center;font-size:20px;margin:20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 25px}.item span{display:block;font-size:9px;text-transform:uppercase;color:#64748b;font-weight:bold}.item b{font-size:12px}.summary{margin:18px 0;border:1px solid #e2e8f0;border-radius:9px;padding:12px}.line{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eef2f7;font-size:12px}.line:last-child{border:0;font-weight:bold;font-size:14px}table{width:100%;border-collapse:collapse;font-size:9px;margin-top:15px}th{background:#f8fafc;text-align:left}th,td{padding:6px;border:1px solid #e2e8f0}.footer{margin-top:25px;text-align:center;color:#64748b;font-size:10px}</style></head><body><div class="head"><img class="logo" src="${location.origin}/assets/logo.png"><div class="brand"><h1>Groupe Scolaire Sciences et Lettres</h1><p>Bulletin de rémunération enseignant</p></div></div><div class="title">Bulletin de paie — ${this.monthName(p.month)} ${p.year}</div><div class="grid"><div class="item"><span>Enseignant</span><b>${this.escape(p.teacherName)}</b></div><div class="item"><span>Matricule</span><b>${this.escape(p.employeeNumber)}</b></div><div class="item"><span>Type de rémunération</span><b>${this.compensationLabel(p.compensationType)}</b></div><div class="item"><span>Version</span><b>V${p.versionNumber}</b></div><div class="item"><span>Période</span><b>${this.formatDate(p.startDate)} au ${this.formatDate(p.endDate)}</b></div><div class="item"><span>Statut</span><b>${this.statusLabel(p.status)}</b></div></div><div class="summary"><div class="line"><span>Salaire de base</span><b>${this.money(p.baseSalary)} DA</b></div><div class="line"><span>Part fixe</span><b>${this.money(p.fixedPart)} DA</b></div><div class="line"><span>Heures rémunérées</span><b>${this.num(p.regularHours)} h</b></div><div class="line"><span>Part horaire</span><b>${this.money(p.hourlyAmount)} DA</b></div><div class="line"><span>Primes</span><b>${this.money(p.bonusTotal)} DA</b></div><div class="line"><span>Retenue absence</span><b>${this.money(p.absenceDeduction)} DA</b></div><div class="line"><span>Retenues totales</span><b>${this.money(p.deductionTotal)} DA</b></div><div class="line"><span>Remboursements</span><b>${this.money(p.reimbursementTotal)} DA</b></div><div class="line"><span>Net à payer</span><b>${this.money(p.netSalary)} DA</b></div></div>${attendanceRows ? `<h3 style="font-size:12px">Détail des séances rémunérées</h3><table><thead><tr><th>Date</th><th>Classe</th><th>Matière</th><th>Horaire</th><th>Assiduité</th><th>Payé</th><th>Taux</th><th>Montant</th></tr></thead><tbody>${attendanceRows}</tbody></table>` : ''}<div class="footer">Document généré par le système de gestion scolaire — Groupe Scolaire Sciences et Lettres</div><script>window.onload=()=>{setTimeout(()=>window.print(),250)};<\/script></body></html>`;
    this.printHtml(html);
  }

  private printHtml(html: string): void {
    const w = window.open('', '_blank', 'width=980,height=900');
    if (!w) {
      this.error = "Le navigateur a bloqué la fenêtre d'impression. Autorisez les fenêtres contextuelles pour cette page.";
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }


  get paidCount(): number { return this.items.filter((p) => p.status === 'PAID').length; }
  get partialCount(): number { return this.items.filter((p) => p.status === 'PARTIALLY_PAID').length; }
  get totalNet(): number { return this.items.reduce((sum, p) => sum + Number(p.netSalary || 0), 0); }
  get totalPaid(): number { return this.items.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0); }
  get totalRemaining(): number { return this.items.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0); }
  get selectedAttendanceLines() { return this.selectedPayroll?.attendanceLines ?? []; }

  selectedPeriod(): PayrollPeriod | null {
    return this.periods.find((p) => p.id === this.selectedPeriodId) ?? null;
  }

  periodLabel(p: PayrollPeriod): string {
    return `${this.monthName(p.month)} ${p.year} · ${p.schoolYear ?? 'Année scolaire'}`;
  }

  monthName(month: number): string {
    return this.months.find((m) => m.value === month)?.label ?? String(month);
  }

  compensationLabel(value: string): string {
    if (value === 'MONTHLY') return 'Mensuel';
    if (value === 'HOURLY') return 'Horaire';
    if (value === 'MIXED') return 'Mixte';
    return value || '—';
  }

  statusLabel(value: string): string {
    if (value === 'CALCULATED') return 'Calculée';
    if (value === 'PARTIALLY_PAID') return 'Partiellement payée';
    if (value === 'PAID') return 'Payée';
    if (value === 'CANCELLED') return 'Annulée';
    return value || '—';
  }

  statusClass(value: string): string {
    if (value === 'PAID') return 'paid';
    if (value === 'PARTIALLY_PAID') return 'partial';
    if (value === 'CANCELLED') return 'cancelled';
    return 'calculated';
  }

  compensationClass(value: string): string {
    if (value === 'MONTHLY') return 'monthly';
    if (value === 'HOURLY') return 'hourly';
    return 'mixed';
  }

  attendanceLabel(value: string): string {
    if (value === 'PRESENT') return 'Présent';
    if (value === 'ABSENT') return 'Absent';
    if (value === 'RETARD') return 'Retard';
    return value;
  }

  money(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  num(value: number | null | undefined): string {
    return Number(value ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const [y, m, d] = value.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
  }

  private escape(value: unknown): string {
    const chars: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return String(value ?? '').replace(/[&<>'"]/g, (c) => chars[c] ?? c);
  }

  private msg(e: any): string {
    return e?.error?.message ?? e?.error?.error ?? 'Une erreur est survenue.';
  }
}
