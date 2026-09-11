import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GuardianChoice, SchoolYearRef } from '../../models/finance-reference.model';
import { FamilyFinancialSituation } from '../../models/finance-tracking.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({
  selector: 'app-financial-situations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-situations.component.html',
  styleUrl: './financial-situations.component.scss',
})
export class FinancialSituationsComponent {
  private tracking = inject(FinanceTrackingService);
  private refs = inject(FinanceReferenceService);

  schoolYears = signal<SchoolYearRef[]>([]);
  guardians = signal<GuardianChoice[]>([]);
  selectedGuardian = signal<GuardianChoice | null>(null);
  situation = signal<FamilyFinancialSituation | null>(null);
  loading = signal(false);
  error = signal('');
  search = '';
  schoolYearId: number | null = null;

  constructor() {
    this.refs.schoolYears().subscribe({
      next: (years) => {
        this.schoolYears.set(years);
        this.schoolYearId = years.find((y) => y.currentYear)?.id ?? years[0]?.id ?? null;
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  searchGuardians(): void {
    if (!this.search.trim()) return;
    this.refs.guardians(this.search.trim(), 0, 10).subscribe({
      next: (r) => this.guardians.set(r.content),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  chooseGuardian(g: GuardianChoice): void {
    this.selectedGuardian.set(g);
    this.guardians.set([]);
    this.search = `${g.person?.lastName ?? ''} ${g.person?.firstName ?? ''}`.trim();
    this.load();
  }

  load(): void {
    const guardian = this.selectedGuardian();
    if (!guardian || !this.schoolYearId) return;
    this.loading.set(true);
    this.error.set('');
    this.tracking.family(guardian.id, this.schoolYearId).subscribe({
      next: (x) => {
        this.situation.set(x);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(this.msg(e));
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: string): string {
    return ({ DUE: 'À payer', PARTIALLY_PAID: 'Partiel', PAID: 'Payé', CANCELLED: 'Annulé' } as Record<string,string>)[status] ?? status;
  }

  msg(e: any): string {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
