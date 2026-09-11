import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { ClassGroupService } from '../services/class-group.service';
import { SchoolYearService } from '../../school-years/services/school-year.service';
import { LevelService } from '../../levels/services/level.service';
import { CampusService } from '../../campuses/services/campus.service';
import { ClassGroup, ClassGroupRequest } from '../models/class-group.model';
import { SchoolYear } from '../../school-years/models/school-year.model';
import { Level } from '../../levels/models/level.model';
import { Campus } from '../../campuses/models/campus.model';
@Component({
  selector: 'app-class-group-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './class-group-list.component.html',
  styleUrl: './class-group-list.component.scss',
})
export class ClassGroupListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(ClassGroupService);
  private ys = inject(SchoolYearService);
  private ls = inject(LevelService);
  private cs = inject(CampusService);
  private auth = inject(AuthService);
  items = signal<ClassGroup[]>([]);
  years = signal<SchoolYear[]>([]);
  levels = signal<Level[]>([]);
  campuses = signal<Campus[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<ClassGroup | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    schoolYearId: [0, [Validators.required, Validators.min(1)]],
    levelId: [0, [Validators.required, Validators.min(1)]],
    campusId: [0, [Validators.required, Validators.min(1)]],
    code: ['', Validators.required],
    name: ['', Validators.required],
    capacity: [0],
    status: ['ACTIVE', Validators.required],
  });
  constructor() {
    this.load();
    this.ys.getAll().subscribe((d) => this.years.set(d));
    this.ls
      .getAll()
      .subscribe((d) => this.levels.set(d.filter((x) => x.active)));
    this.cs
      .getAll()
      .subscribe((d) => this.campuses.set(d.filter((x) => x.active)));
  }
  canCreate() {
    return this.auth.hasPermission('CLASSE_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('CLASSE_MODIFIER');
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
  name(list: any[], id: number) {
    return (
      list.find((x) => x.id === id)?.name ||
      list.find((x) => x.id === id)?.label ||
      '—'
    );
  }
  openCreate() {
    this.editing.set(null);
    this.form.reset({
      schoolYearId: this.years().find((x) => x.currentYear)?.id ?? 0,
      levelId: 0,
      campusId: 0,
      code: '',
      name: '',
      capacity: 0,
      status: 'ACTIVE',
    });
    this.modal.set(true);
  }
  openEdit(i: ClassGroup) {
    this.editing.set(i);
    this.form.reset({
      schoolYearId: i.schoolYearId,
      levelId: i.levelId,
      campusId: i.campusId,
      code: i.code,
      name: i.name,
      capacity: i.capacity ?? 0,
      status: i.status,
    });
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
    const r: ClassGroupRequest = {
      schoolYearId: Number(v.schoolYearId),
      levelId: Number(v.levelId),
      campusId: Number(v.campusId),
      code: v.code.trim(),
      name: v.name.trim(),
      capacity: v.capacity ? Number(v.capacity) : null,
      status: v.status,
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
