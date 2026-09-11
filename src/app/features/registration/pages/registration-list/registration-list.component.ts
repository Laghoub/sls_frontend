import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  RegistrationCase,
  RegistrationStatus,
} from '../../models/registration.model';
import { SchoolYearRef } from '../../models/reference.model';
import { RegistrationCaseService } from '../../services/registration-case.service';
import { RegistrationReferenceService } from '../../services/registration-reference.service';
@Component({
  selector: 'app-registration-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration-list.component.html',
  styleUrl: './registration-list.component.scss',
})
export class RegistrationListComponent {
  private service = inject(RegistrationCaseService);
  private refs = inject(RegistrationReferenceService);
  auth = inject(AuthService);
  items = signal<RegistrationCase[]>([]);
  years = signal<SchoolYearRef[]>([]);
  loading = signal(false);
  error = signal('');
  page = signal(0);
  size = signal(20);
  total = signal(0);
  pages = signal(0);
  search = '';
  schoolYearId: number | null = null;
  status: RegistrationStatus | null = null;
  statuses: RegistrationStatus[] = [
    'PRE_INSCRIPTION',
    'EN_ATTENTE_PAIEMENT',
    'PAYE_A_COMPLETER',
    'EN_COURS',
    'INCOMPLET',
    'FINALISE',
    'ANNULE',
  ];
  constructor() {
    this.refs.schoolYears().subscribe((y) => {
      this.years.set(y);
      this.schoolYearId = y.find((x) => x.currentYear)?.id ?? null;
      this.load();
    });
  }
  load() {
    this.loading.set(true);
    this.service
      .search(
        this.page(),
        this.size(),
        this.search,
        this.schoolYearId,
        this.status,
      )
      .subscribe({
        next: (r) => {
          this.items.set(r.content);
          this.total.set(r.totalElements);
          this.pages.set(r.totalPages);
          this.loading.set(false);
        },
        error: (e) => {
          this.error.set(
            e?.error?.message ?? 'Impossible de charger les inscriptions.',
          );
          this.loading.set(false);
        },
      });
  }
  filter() {
    this.page.set(0);
    this.load();
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
  go(i: number) {
    this.page.set(i);
    this.load();
  }
  changeSize() {
    this.page.set(0);
    this.load();
  }
  range() {
    const n = this.pages(),
      p = this.page();
    const a = Math.max(0, p - 2),
      b = Math.min(n - 1, p + 2);
    return n ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [];
  }
  label(s: string) {
    return s.replaceAll('_', ' ');
  }
}
