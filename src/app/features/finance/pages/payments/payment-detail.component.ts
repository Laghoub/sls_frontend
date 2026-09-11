import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  PaymentDetail,
  PaymentMethod,
  Refund,
} from '../../models/finance.model';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentService } from '../../services/payment.service';
import { RefundService } from '../../services/refund.service';
import { PaymentReceipt } from '../../models/finance-tracking.model';
import { PaymentReceiptService } from '../../services/payment-receipt.service';
@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss',
})
export class PaymentDetailComponent {
  private route = inject(ActivatedRoute);
  private s = inject(PaymentService);
  private refunds = inject(RefundService);
  private methodsService = inject(PaymentMethodService);
  private receipts = inject(PaymentReceiptService);
  auth = inject(AuthService);
  detail = signal<PaymentDetail | null>(null);
  refundItems = signal<Refund[]>([]);
  methods = signal<PaymentMethod[]>([]);
  error = signal('');
  receipt = signal<PaymentReceipt | null>(null);
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
    this.load();
  }
  load() {
    this.s.get(this.id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.refunds
          .search(this.id, 0, 100)
          .subscribe((r) => this.refundItems.set(r.content));
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  allocatedTotal() {
    return (
      this.detail()?.allocations.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      ) ?? 0
    );
  }
  method(id: number) {
    return this.methods().find((m) => m.id === id)?.name ?? `Mode ${id}`;
  }
  cancel() {
    if (!this.cancelReason.trim()) return;
    this.s.cancel(this.id, this.cancelReason.trim()).subscribe({
      next: () => {
        this.cancelModal.set(false);
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  openRefund() {
    const p = this.detail()?.payment;
    this.refundAmount = p?.totalAmount ?? 0;
    this.refundReason = '';
    this.refundModal.set(true);
  }
  createRefund() {
    if (
      !this.refundMethodId ||
      this.refundAmount <= 0 ||
      !this.refundReason.trim()
    )
      return;
    this.refunds
      .create({
        paymentId: this.id,
        amount: this.refundAmount,
        paymentMethodId: this.refundMethodId,
        reason: this.refundReason.trim(),
        cashRegisterSessionId: this.refundCashSessionId,
      })
      .subscribe({
        next: () => {
          this.refundModal.set(false);
          this.load();
        },
        error: (e) => this.error.set(this.msg(e)),
      });
  }

  openReceipt() {
    this.receipts.get(this.id).subscribe({
      next: (r) => {
        this.receipt.set(r);
        this.receiptModal.set(true);
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  printReceipt() {
    const r = this.receipt();
    if (!r) return;
    const rows = r.allocations.map(a => `<tr><td>${a.studentLastName} ${a.studentFirstName}</td><td>${a.studentNumber}</td><td>${a.chargeLabel}</td><td style="text-align:right">${Number(a.amount).toFixed(2)}</td></tr>`).join('');
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reçu ${r.paymentNumber}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}h1{margin-bottom:4px}.muted{color:#64748b}.box{border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:18px 0}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left}.total{font-size:24px;font-weight:800;text-align:right;margin-top:18px}</style></head><body><h1>Groupe Scolaire Sciences et Lettres</h1><div class="muted">Reçu de paiement</div><div class="box"><b>${r.paymentNumber}</b><br>Date : ${new Date(r.paymentDate).toLocaleString('fr-FR')}<br>Responsable : ${r.guardianLastName} ${r.guardianFirstName}<br>Mode : ${r.paymentMethodName}</div><table><thead><tr><th>Élève</th><th>Matricule</th><th>Créance</th><th>Montant</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total : ${Number(r.totalAmount).toFixed(2)}</div></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
