import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClassGroupRef, SchoolYearRef } from '../../models/finance-reference.model';
import { GlobalFinancialSituation, GlobalPaymentCell, GlobalSituationFilters } from '../../models/global-financial-situation.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { GlobalFinancialSituationService } from '../../services/global-financial-situation.service';

@Component({
  selector: 'app-global-financial-situation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-financial-situation.component.html',
  styleUrl: './global-financial-situation.component.scss',
})
export class GlobalFinancialSituationComponent {
  private api = inject(GlobalFinancialSituationService);
  private refs = inject(FinanceReferenceService);

  schoolYears = signal<SchoolYearRef[]>([]);
  classGroups = signal<ClassGroupRef[]>([]);
  data = signal<GlobalFinancialSituation | null>(null);
  loading = signal(false);
  error = signal('');

  readonly months = [
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }, { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
  ];

  filters: GlobalSituationFilters = {
    schoolYearId: null,
    classGroupId: null,
    parent: '',
    cutoffMonth: this.currentSchoolMonth(),
    status: '',
  };

  constructor() {
    forkJoin({ years: this.refs.schoolYears(), classes: this.refs.classGroups() }).subscribe({
      next: ({ years, classes }) => {
        this.schoolYears.set(years);
        this.classGroups.set(classes.filter(x => x.status === 'ACTIVE'));
        const current = years.find(x => x.currentYear) ?? years[0];
        this.filters.schoolYearId = current?.id ?? null;
        if (this.filters.schoolYearId) this.load();
      },
      error: e => this.error.set(this.msg(e)),
    });
  }

  visibleClasses(): ClassGroupRef[] {
    return this.classGroups().filter(x => !this.filters.schoolYearId || x.schoolYearId === this.filters.schoolYearId);
  }

  onYearChange(): void {
    this.filters.classGroupId = null;
  }

  load(): void {
    if (!this.filters.schoolYearId) return;
    this.loading.set(true);
    this.error.set('');
    this.api.get(this.filters).subscribe({
      next: x => { this.data.set(x); this.loading.set(false); },
      error: e => { this.loading.set(false); this.error.set(this.msg(e)); },
    });
  }

  reset(): void {
    const current = this.schoolYears().find(x => x.currentYear) ?? this.schoolYears()[0];
    this.filters = { schoolYearId: current?.id ?? null, classGroupId: null, parent: '', cutoffMonth: this.currentSchoolMonth(), status: '' };
    this.load();
  }

  exportPdf(): void {
    window.print();
  }

  yearLabel(): string {
    return this.schoolYears().find(x => x.id === this.filters.schoolYearId)?.label ?? '—';
  }

  cutoffLabel(): string {
    return this.months.find(x => x.value === this.filters.cutoffMonth)?.label ?? '—';
  }

  money(v: number | null | undefined): number { return Number(v ?? 0); }

  statusLabel(status: string): string {
    return ({ PAID: 'PAYÉ', PARTIAL: 'PARTIEL', UNPAID: 'IMPAYÉ', UPCOMING: 'À VENIR', NOT_APPLICABLE: '—' } as Record<string, string>)[status] ?? status;
  }

  statusClass(cell: GlobalPaymentCell): string {
    return `status-${String(cell.status).toLowerCase().replace('_', '-')}${cell.overdue ? ' overdue' : ''}`;
  }

  private currentSchoolMonth(): number {
    const m = new Date().getMonth() + 1;
    return [9,10,11,12,1,2,3,4,5,6].includes(m) ? m : (m === 7 || m === 8 ? 6 : 9);
  }

  private msg(e: any): string { return e?.error?.message ?? e?.message ?? 'Impossible de charger la situation globale.'; }
}
