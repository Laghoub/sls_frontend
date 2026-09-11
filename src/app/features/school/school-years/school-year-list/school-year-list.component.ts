import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { SchoolYearService } from '../services/school-year.service';
import { SchoolYear, SchoolYearRequest } from '../models/school-year.model';
@Component({
  selector: 'app-school-year-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './school-year-list.component.html',
  styleUrl: './school-year-list.component.scss',
})
export class SchoolYearListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(SchoolYearService);
  private auth = inject(AuthService);
  items = signal<SchoolYear[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<SchoolYear | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    label: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: ['PLANNED', Validators.required],
    currentYear: [false],
  });
  constructor() {
    this.load();
  }
  canCreate() {
    return this.auth.hasPermission('ANNEE_SCOLAIRE_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('ANNEE_SCOLAIRE_MODIFIER');
  }
  canCurrent() {
    return this.auth.hasPermission('ANNEE_SCOLAIRE_DEFINIR_COURANTE');
  }
  load() {
    this.loading.set(true);
    this.svc
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.items.set(d),
        error: (e) => this.fail(e),
      });
  }
  openCreate() {
    this.editing.set(null);
    this.form.reset({
      code: '',
      label: '',
      startDate: '',
      endDate: '',
      status: 'PLANNED',
      currentYear: false,
    });
    this.modal.set(true);
  }
  openEdit(i: SchoolYear) {
    this.editing.set(i);
    this.form.reset(i);
    this.modal.set(true);
  }
  close() {
    if (!this.saving()) this.modal.set(false);
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.endDate <= v.startDate) {
      this.error.set(
        'La date de fin doit être postérieure à la date de début.',
      );
      return;
    }
    const r: SchoolYearRequest = v,
      e = this.editing();
    this.saving.set(true);
    (e ? this.svc.update(e.id, r) : this.svc.create(r))
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.modal.set(false);
          this.success.set('Enregistrement effectué.');
          this.load();
        },
        error: (x) => this.fail(x),
      });
  }
  setCurrent(i: SchoolYear) {
    this.svc.setCurrent(i.id).subscribe({
      next: () => {
        this.success.set('Année courante mise à jour.');
        this.load();
      },
      error: (e) => this.fail(e),
    });
  }
  label(s: string) {
    return (
      (
        {
          PLANNED: 'Planifiée',
          ACTIVE: 'Active',
          CLOSED: 'Clôturée',
          ARCHIVED: 'Archivée',
        } as any
      )[s] || s
    );
  }
  private fail(e: any) {
    console.error(e);
    this.error.set(e?.error?.message || 'Opération impossible.');
  }
}
