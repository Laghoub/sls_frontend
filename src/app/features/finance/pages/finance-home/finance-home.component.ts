import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CampusRef,
  ClassGroupRef,
  CycleRef,
  LevelRef,
  SchoolYearRef,
} from '../../models/finance-reference.model';
import { FeeType, PaymentMethod } from '../../models/finance.model';
import {
  AdvancedFinanceDashboard,
  FinanceDashboardBreakdown,
  FinanceDashboardFilters,
  FinanceDashboardMonthlyTrend,
} from '../../models/finance-dashboard.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FeeTypeService } from '../../services/fee-type.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { FinanceDashboardService } from '../../services/finance-dashboard.service';

@Component({
  selector: 'app-finance-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './finance-home.component.html',
  styleUrl: './finance-home.component.scss',
})
export class FinanceHomeComponent {
  private refs = inject(FinanceReferenceService);
  private feeTypesApi = inject(FeeTypeService);
  private paymentMethodsApi = inject(PaymentMethodService);
  private dashboardApi = inject(FinanceDashboardService);

  schoolYears = signal<SchoolYearRef[]>([]);
  cycles = signal<CycleRef[]>([]);
  levels = signal<LevelRef[]>([]);
  classGroups = signal<ClassGroupRef[]>([]);
  campuses = signal<CampusRef[]>([]);
  feeTypes = signal<FeeType[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);

  dashboard = signal<AdvancedFinanceDashboard | null>(null);
  loading = signal(false);
  refsLoading = signal(true);
  error = signal('');
  filtersExpanded = signal(true);

  filters: FinanceDashboardFilters = {
    schoolYearId: null,
    cycleId: null,
    levelId: null,
    classGroupId: null,
    campusId: null,
    feeTypeId: null,
    paymentMethodId: null,
    from: null,
    to: null,
  };

  filteredLevels = computed(() => {
    const cycleId = this.filters.cycleId;
    return this.levels().filter((x) => !cycleId || x.cycleId === cycleId);
  });

  filteredClasses = computed(() => {
    return this.classGroups().filter((x) => {
      if (this.filters.schoolYearId && x.schoolYearId !== this.filters.schoolYearId) return false;
      if (this.filters.levelId && x.levelId !== this.filters.levelId) return false;
      if (this.filters.campusId && x.campusId !== this.filters.campusId) return false;
      if (this.filters.cycleId) {
        const level = this.levels().find((l) => l.id === x.levelId);
        if (!level || level.cycleId !== this.filters.cycleId) return false;
      }
      return true;
    });
  });

  constructor() {
    this.loadReferences();
  }

  private loadReferences(): void {
    this.refsLoading.set(true);
    forkJoin({
      years: this.refs.schoolYears(),
      cycles: this.refs.cycles(),
      levels: this.refs.levels(),
      classes: this.refs.classGroups(),
      campuses: this.refs.campuses(),
      feeTypes: this.feeTypesApi.search('', 0, 100),
      paymentMethods: this.paymentMethodsApi.all(),
    }).subscribe({
      next: (data) => {
        this.schoolYears.set(data.years);
        this.cycles.set(data.cycles.filter((x) => x.active));
        this.levels.set(data.levels.filter((x) => x.active));
        this.classGroups.set(data.classes.filter((x) => x.status === 'ACTIVE'));
        this.campuses.set(data.campuses.filter((x) => x.active));
        this.feeTypes.set(data.feeTypes.content.filter((x) => x.active));
        this.paymentMethods.set(data.paymentMethods.filter((x) => x.active));

        const current = data.years.find((x) => x.currentYear) ?? data.years[0];
        if (current) {
          this.filters.schoolYearId = current.id;
          this.filters.from = current.startDate;
          this.filters.to = current.endDate;
        }

        this.refsLoading.set(false);
        this.loadDashboard();
      },
      error: (e) => {
        this.refsLoading.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');
    this.dashboardApi.analytics(this.filters).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  resetFilters(): void {
    const current = this.schoolYears().find((x) => x.currentYear) ?? this.schoolYears()[0];
    this.filters = {
      schoolYearId: current?.id ?? null,
      cycleId: null,
      levelId: null,
      classGroupId: null,
      campusId: null,
      feeTypeId: null,
      paymentMethodId: null,
      from: current?.startDate ?? null,
      to: current?.endDate ?? null,
    };
    this.loadDashboard();
  }

  onSchoolYearChange(): void {
    this.filters.classGroupId = null;
    const year = this.schoolYears().find((x) => x.id === this.filters.schoolYearId);
    if (year) {
      this.filters.from = year.startDate;
      this.filters.to = year.endDate;
    }
  }

  onCycleChange(): void {
    this.filters.levelId = null;
    this.filters.classGroupId = null;
  }

  onLevelChange(): void {
    this.filters.classGroupId = null;
  }

  onCampusChange(): void {
    if (this.filters.classGroupId && !this.filteredClasses().some((x) => x.id === this.filters.classGroupId)) {
      this.filters.classGroupId = null;
    }
  }

  money(value: number | null | undefined): number {
    return Number(value ?? 0);
  }

  percent(value: number | null | undefined): number {
    const n = Number(value ?? 0);
    return Math.max(0, Math.min(100, n));
  }

  maxBreakdown(rows: FinanceDashboardBreakdown[], field: 'charged' | 'collected' | 'remaining' | 'overdue'): number {
    return Math.max(1, ...rows.map((r) => Number(r[field] ?? 0)));
  }

  barWidth(value: number, max: number): number {
    if (!max || max <= 0) return 0;
    return Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));
  }

  maxTrend(rows: FinanceDashboardMonthlyTrend[]): number {
    return Math.max(1, ...rows.flatMap((x) => [Number(x.charged || 0), Number(x.netCollected || 0)]));
  }

  monthLabel(value: string): string {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' }).format(date);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      DUE: 'À payer',
      PARTIALLY_PAID: 'Partiellement payée',
      PAID: 'Payée',
      OVERDUE: 'En retard',
      CANCELLED: 'Annulée',
    };
    return labels[status] ?? status;
  }

  msg(e: any): string {
    return e?.error?.message ?? e?.message ?? 'Une erreur est survenue.';
  }
}
