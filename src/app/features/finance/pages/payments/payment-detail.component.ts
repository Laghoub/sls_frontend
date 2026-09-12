import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  CashRegisterSession,
  PaymentDetail,
  PaymentMethod,
  Refund,
} from '../../models/finance.model';
import { PaymentReceipt } from '../../models/finance-tracking.model';
import { CashRegisterService } from '../../services/cash-register.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentReceiptService } from '../../services/payment-receipt.service';
import { PaymentService } from '../../services/payment.service';
import { RefundService } from '../../services/refund.service';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss',
})
export class PaymentDetailComponent {
  private route = inject(ActivatedRoute);
  private payments = inject(PaymentService);
  private refunds = inject(RefundService);
  private methodsService = inject(PaymentMethodService);
  private receipts = inject(PaymentReceiptService);
  private cashRegisters = inject(CashRegisterService);

  auth = inject(AuthService);
  detail = signal<PaymentDetail | null>(null);
  refundItems = signal<Refund[]>([]);
  methods = signal<PaymentMethod[]>([]);
  currentSession = signal<CashRegisterSession | null>(null);
  receipt = signal<PaymentReceipt | null>(null);
  error = signal('');
  success = signal('');
  receiptModal = signal(false);
  cancelModal = signal(false);
  refundModal = signal(false);

  cancelReason = '';
  refundAmount = 0;
  refundReason = '';
  refundMethodId: number | null = null;
  refundCashSessionId: number | null = null;
  id = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.methodsService.all().subscribe((x) => {
      this.methods.set(x);
      this.refundMethodId = x.find((m) => m.active)?.id ?? null;
    });
    this.cashRegisters.currentSession().subscribe({
      next: (session) => {
        this.currentSession.set(session);
        this.refundCashSessionId = session?.id ?? null;
      },
      error: () => this.currentSession.set(null),
    });
    this.load();
  }

  load() {
    this.error.set('');
    this.payments.get(this.id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.refunds.search(this.id, 0, 100).subscribe({
          next: (r) => this.refundItems.set(r.content),
          error: (e) => this.error.set(this.msg(e)),
        });
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  allocatedTotal() {
    return this.detail()?.allocations.reduce((sum, a) => sum + Number(a.amount), 0) ?? 0;
  }

  refundedTotal() {
    return this.refundItems().reduce((sum, r) => sum + Number(r.amount), 0);
  }

  refundableAmount() {
    const total = Number(this.detail()?.payment.totalAmount ?? 0);
    return Math.max(0, total - this.refundedTotal());
  }

  creditReversedTotal() {
    return this.refundItems().reduce((sum, r) => sum + Number(r.creditReversedAmount ?? 0), 0);
  }

  allocationReversedTotal() {
    return this.refundItems().reduce((sum, r) => sum + Number(r.allocationReversedAmount ?? 0), 0);
  }

  method(id: number) {
    return this.methods().find((m) => m.id === id)?.name ?? `Mode ${id}`;
  }

  selectedRefundMethod() {
    return this.methods().find((m) => m.id === this.refundMethodId) ?? null;
  }

  refundRequiresCashSession() {
    return this.selectedRefundMethod()?.code?.toUpperCase() !== 'VIREMENT';
  }

  canCreateRefund() {
    if (!this.refundMethodId || this.refundAmount <= 0 || !this.refundReason.trim()) return false;
    if (this.refundAmount > this.refundableAmount()) return false;
    if (this.refundRequiresCashSession() && !this.refundCashSessionId) return false;
    return true;
  }

  cancel() {
    if (!this.cancelReason.trim()) return;
    this.payments.cancel(this.id, this.cancelReason.trim()).subscribe({
      next: () => {
        this.cancelModal.set(false);
        this.success.set('Paiement annulé.');
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  openRefund() {
    this.refundAmount = this.refundableAmount();
    this.refundReason = '';
    this.refundCashSessionId = this.currentSession()?.id ?? null;
    this.refundModal.set(true);
  }

  createRefund() {
    if (!this.canCreateRefund() || !this.refundMethodId) return;
    this.error.set('');
    this.success.set('');
    this.refunds.create({
      paymentId: this.id,
      amount: this.refundAmount,
      paymentMethodId: this.refundMethodId,
      reason: this.refundReason.trim(),
      cashRegisterSessionId: this.refundRequiresCashSession() ? this.refundCashSessionId : null,
    }).subscribe({
      next: (created) => {
        this.refundModal.set(false);
        const parts: string[] = [];
        if (Number(created.creditReversedAmount) > 0) {
          parts.push(`${this.money(created.creditReversedAmount)} retirés de l'avoir familial`);
        }
        if (Number(created.allocationReversedAmount) > 0) {
          parts.push(`${this.money(created.allocationReversedAmount)} de créances réouvertes`);
        }
        this.success.set(parts.length ? `Remboursement validé : ${parts.join(' et ')}.` : 'Remboursement validé.');
        this.load();
        this.openReceipt(false);
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  openReceipt(openModal = true) {
    this.receipts.get(this.id).subscribe({
      next: (r) => {
        this.receipt.set(r);
        if (openModal) this.receiptModal.set(true);
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  printReceipt() {
    const r = this.receipt();
    if (!r) return;
    const rows = r.allocations.map((a) => `
      <tr>
        <td>${this.escapeHtml(`${a.studentLastName ?? ''} ${a.studentFirstName ?? ''}`.trim() || '—')}</td>
        <td>${this.escapeHtml(a.studentNumber ?? '—')}</td>
        <td>${this.escapeHtml(a.chargeLabel)}</td>
        <td class="num">${this.money(a.amount)}</td>
        <td class="num">${this.money(a.refundedAmount)}</td>
        <td class="num"><strong>${this.money(a.netAmount)}</strong></td>
      </tr>`).join('');
    const creditNote = Number(r.creditCreatedAmount) > 0
      ? `<div class="notice">Sur les ${this.money(r.totalAmount)} reçus, ${this.money(r.allocatedAmount)} ont été affectés aux créances et ${this.money(r.creditCreatedAmount)} ont été placés dans l'avoir familial. Avoir actuellement disponible : ${this.money(r.creditRemainingAmount)}.</div>`
      : '';
    const refundNote = Number(r.refundedAmount) > 0
      ? `<div class="notice refund">Remboursements effectués : ${this.money(r.refundedAmount)}. Montant net conservé par l'école : ${this.money(r.netReceivedAmount)}.</div>`
      : '';
    const w = window.open('', '_blank', 'width=980,height=760');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reçu ${this.escapeHtml(r.paymentNumber)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:32px;color:#0f172a;max-width:980px;margin:auto}h1{margin:0 0 4px;font-size:24px}.muted{color:#64748b}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:18px 0;line-height:1.7}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.kpi{border:1px solid #e2e8f0;border-radius:12px;padding:14px}.kpi span{display:block;color:#64748b;font-size:12px;text-transform:uppercase;margin-bottom:6px}.kpi strong{font-size:20px}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f8fafc;font-size:12px;text-transform:uppercase}.num{text-align:right;white-space:nowrap}.notice{margin:18px 0;padding:14px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;line-height:1.5}.notice.refund{background:#fff7ed;border-color:#fed7aa}.footer{margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px}@media print{body{padding:0}.no-print{display:none}}
    </style></head><body>
      <h1>Groupe Scolaire Sciences et Lettres</h1><div class="muted">Reçu de paiement</div>
      <div class="box"><strong>${this.escapeHtml(r.paymentNumber)}</strong><br>Date : ${new Date(r.paymentDate).toLocaleString('fr-FR')}<br>Responsable : ${this.escapeHtml(`${r.guardianLastName} ${r.guardianFirstName}`)}<br>Mode : ${this.escapeHtml(r.paymentMethodName)}</div>
      <div class="summary">
        <div class="kpi"><span>Montant reçu</span><strong>${this.money(r.totalAmount)}</strong></div>
        <div class="kpi"><span>Créances réglées</span><strong>${this.money(r.allocatedAmount)}</strong></div>
        <div class="kpi"><span>Avoir créé</span><strong>${this.money(r.creditCreatedAmount)}</strong></div>
      </div>
      <table><thead><tr><th>Élève</th><th>Matricule</th><th>Créance</th><th class="num">Affecté</th><th class="num">Remboursé</th><th class="num">Net</th></tr></thead><tbody>${rows}</tbody></table>
      ${creditNote}${refundNote}
      <div class="footer">Document généré par le système de gestion du Groupe Scolaire Sciences et Lettres.</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  money(value: number | null | undefined) {
    return `${Number(value ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;
  }

  escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[ch] ?? ch);
  }

  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
