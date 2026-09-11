import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SchoolYearRef } from '../../models/finance-reference.model';
import { FinanceDashboard } from '../../models/finance-tracking.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({
  selector: 'app-finance-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './finance-home.component.html',
  styleUrl: './finance-home.component.scss',
})
export class FinanceHomeComponent {
  private refs = inject(FinanceReferenceService);
  private tracking = inject(FinanceTrackingService);

  schoolYears = signal<SchoolYearRef[]>([]);
  dashboard = signal<FinanceDashboard | null>(null);
  error = signal('');
  schoolYearId: number | null = null;

  constructor() {
    this.refs.schoolYears().subscribe({
      next: (years) => {
        this.schoolYears.set(years);
        this.schoolYearId = years.find((x) => x.currentYear)?.id ?? years[0]?.id ?? null;
        this.loadDashboard();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  loadDashboard(): void {
    if (!this.schoolYearId) return;
    this.tracking.dashboard(this.schoolYearId).subscribe({
      next: (x) => this.dashboard.set(x),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  msg(e: any): string {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
