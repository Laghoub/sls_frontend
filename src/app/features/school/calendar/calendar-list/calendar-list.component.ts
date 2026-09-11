import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { SchoolCalendarExceptionService } from '../services/school-calendar-exception.service';
import { SchoolYearService } from '../../school-years/services/school-year.service';
import { CampusService } from '../../campuses/services/campus.service';
import { CycleService } from '../../cycles/services/cycle.service';
import {
  SchoolCalendarException,
  SchoolCalendarExceptionRequest,
} from '../models/school-calendar-exception.model';
import { SchoolYear } from '../../school-years/models/school-year.model';
import { Campus } from '../../campuses/models/campus.model';
import { Cycle } from '../../cycles/models/cycle.model';
@Component({
  selector: 'app-calendar-list',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './calendar-list.component.html',
  styleUrl: './calendar-list.component.scss',
})
export class CalendarListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(SchoolCalendarExceptionService);
  private ys = inject(SchoolYearService);
  private cs = inject(CampusService);
  private cy = inject(CycleService);
  private auth = inject(AuthService);
  items = signal<SchoolCalendarException[]>([]);
  years = signal<SchoolYear[]>([]);
  campuses = signal<Campus[]>([]);
  cycles = signal<Cycle[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<SchoolCalendarException | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    schoolYearId: [0, [Validators.required, Validators.min(1)]],
    campusId: [0],
    cycleId: [0],
    exceptionDate: ['', Validators.required],
    exceptionType: ['HOLIDAY', Validators.required],
    label: ['', Validators.required],
    description: [''],
  });
  constructor() {
    this.load();
    this.ys.getAll().subscribe((d) => this.years.set(d));
    this.cs
      .getAll()
      .subscribe((d) => this.campuses.set(d.filter((x) => x.active)));
    this.cy
      .getAll()
      .subscribe((d) => this.cycles.set(d.filter((x) => x.active)));
  }
  canManage() {
    return this.auth.hasPermission('CALENDRIER_SCOLAIRE_GERER');
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
      schoolYearId: this.years().find((x) => x.currentYear)?.id ?? 0,
      campusId: 0,
      cycleId: 0,
      exceptionDate: '',
      exceptionType: 'HOLIDAY',
      label: '',
      description: '',
    });
    this.modal.set(true);
  }
  openEdit(i: SchoolCalendarException) {
    this.editing.set(i);
    this.form.reset({
      schoolYearId: i.schoolYearId,
      campusId: i.campusId ?? 0,
      cycleId: i.cycleId ?? 0,
      exceptionDate: i.exceptionDate,
      exceptionType: i.exceptionType,
      label: i.label,
      description: i.description ?? '',
    });
    this.modal.set(true);
  }
  close() {
    if (!this.saving()) this.modal.set(false);
  }
  scope(i: SchoolCalendarException) {
    return [i.campusName, i.cycleName].filter(Boolean).join(' · ') || 'Global';
  }
  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const r: SchoolCalendarExceptionRequest = {
      schoolYearId: Number(v.schoolYearId),
      campusId: v.campusId ? Number(v.campusId) : null,
      cycleId: v.cycleId ? Number(v.cycleId) : null,
      exceptionDate: v.exceptionDate,
      exceptionType: v.exceptionType.trim().toUpperCase(),
      label: v.label.trim(),
      description: v.description.trim() || null,
    };
    const e = this.editing();
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
  private fail(e: any) {
    console.error(e);
    this.error.set(e?.error?.message || 'Opération impossible.');
  }
}
