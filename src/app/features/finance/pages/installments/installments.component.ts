import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EnrollmentChoice,
  SchoolYearRef,
} from '../../models/finance-reference.model';
import { InstallmentGenerationResponse } from '../../models/finance-tracking.model';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { FinanceTrackingService } from '../../services/finance-tracking.service';

@Component({
  selector: 'app-installments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './installments.component.html',
  styleUrl: './installments.component.scss',
})
export class InstallmentsComponent {
  private refs = inject(FinanceReferenceService);
  private tracking = inject(FinanceTrackingService);

  schoolYears = signal<SchoolYearRef[]>([]);
  enrollments = signal<EnrollmentChoice[]>([]);
  result = signal<InstallmentGenerationResponse | null>(null);

  loadingEnrollments = signal(false);
  generating = signal(false);
  error = signal('');
  success = signal('');

  schoolYearId: number | null = null;
  enrollmentId: number | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor() {
    this.refs.schoolYears().subscribe({
      next: (years) => {
        this.schoolYears.set(years);
        this.schoolYearId =
          years.find((x) => x.currentYear)?.id ?? years[0]?.id ?? null;
        this.loadEnrollments();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  loadEnrollments(): void {
    if (!this.schoolYearId) {
      this.enrollments.set([]);
      this.enrollmentId = null;
      return;
    }

    this.error.set('');
    this.success.set('');
    this.result.set(null);
    this.loadingEnrollments.set(true);

    this.refs.enrollments(this.schoolYearId, 0, 100).subscribe({
      next: (r) => {
        this.enrollments.set(r.content);

        if (!r.content.some((x) => x.id === this.enrollmentId)) {
          this.enrollmentId = null;
        }

        this.loadingEnrollments.set(false);
      },
      error: (e) => {
        this.loadingEnrollments.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  selectedEnrollment(): EnrollmentChoice | null {
    if (!this.enrollmentId) return null;
    return this.enrollments().find((x) => x.id === this.enrollmentId) ?? null;
  }

  enrollmentLabel(enrollment: EnrollmentChoice): string {
    const fullName = [
      enrollment.studentLastName,
      enrollment.studentFirstName,
    ]
      .filter(Boolean)
      .join(' ');

    const parts = [
      enrollment.studentNumber,
      fullName || `Élève #${enrollment.studentId}`,
      enrollment.classGroupName,
    ].filter(Boolean);

    return parts.join(' · ');
  }

  generate(): void {
    if (!this.enrollmentId || this.generating()) return;

    this.error.set('');
    this.success.set('');
    this.result.set(null);
    this.generating.set(true);

    this.tracking
      .generateInstallments(this.enrollmentId, {
        feeTypeId: null,
        fromDate: this.fromDate || null,
        toDate: this.toDate || null,
      })
      .subscribe({
        next: (r) => {
          this.result.set(r);
          this.generating.set(false);

          if (r.createdCount > 0) {
            this.success.set(
              `${r.createdCount} échéance(s) créée(s), ${r.skippedCount} déjà existante(s) ignorée(s).`,
            );
          } else if (r.skippedCount > 0) {
            this.success.set(
              `Aucune nouvelle échéance à créer : ${r.skippedCount} échéance(s) existent déjà.`,
            );
          } else {
            this.success.set(
              `Aucune échéance créée. Vérifie qu'un tarif SCOLARITE actif est applicable à cette scolarisation.`,
            );
          }
        },
        error: (e) => {
          this.generating.set(false);
          this.error.set(this.msg(e));
        },
      });
  }

  msg(e: any): string {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
