import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { LevelService } from '../services/level.service';
import { Level, LevelRequest } from '../models/level.model';
import { CycleService } from '../../cycles/services/cycle.service';
import { Cycle } from '../../cycles/models/cycle.model';
@Component({
  selector: 'app-level-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './level-list.component.html',
  styleUrl: './level-list.component.scss',
})
export class LevelListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(LevelService);
  private refSvc = inject(CycleService);
  private auth = inject(AuthService);
  items = signal<Level[]>([]);
  refs = signal<Cycle[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<Level | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    cycleId: [0, [Validators.required, Validators.min(1)]],
    code: ['', Validators.required],
    name: ['', Validators.required],
    displayOrder: [0, Validators.required],
    active: [true],
  });
  constructor() {
    this.load();
    this.refSvc
      .getAll()
      .subscribe((d) =>
        this.refs.set(d.filter((x: any) => x.active !== false)),
      );
  }
  canCreate() {
    return this.auth.hasPermission('NIVEAU_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('NIVEAU_MODIFIER');
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
  refName(id: number) {
    return this.refs().find((x) => x.id === id)?.name || '—';
  }
  openCreate() {
    this.editing.set(null);
    this.form.reset({
      cycleId: 0,
      code: '',
      name: '',
      displayOrder: 0,
      active: true,
    });
    this.modal.set(true);
  }
  openEdit(i: Level) {
    this.editing.set(i);
    this.form.reset({
      cycleId: i.cycleId,
      code: i.code,
      name: i.name,
      displayOrder: i.displayOrder,
      active: i.active,
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
    const r: LevelRequest = {
      cycleId: Number(v.cycleId),
      code: v.code.trim(),
      name: v.name.trim(),
      displayOrder: Number(v.displayOrder),
      active: v.active,
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
