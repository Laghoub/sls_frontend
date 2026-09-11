import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { CycleService } from '../services/cycle.service';
import { Cycle, CycleRequest } from '../models/cycle.model';
@Component({
  selector: 'app-cycle-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cycle-list.component.html',
  styleUrl: './cycle-list.component.scss',
})
export class CycleListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(CycleService);
  private auth = inject(AuthService);
  items = signal<Cycle[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<Cycle | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    displayOrder: [0, Validators.required],
    active: [true],
  });
  constructor() {
    this.load();
  }
  canCreate() {
    return this.auth.hasPermission('CYCLE_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('CYCLE_MODIFIER');
  }
  load() {
    this.loading.set(true);
    this.svc
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (d) => this.items.set(d),
        error: (e) => this.fail(e, 'Chargement impossible.'),
      });
  }
  openCreate() {
    this.error.set('');
    this.editing.set(null);
    this.form.reset({ code: '', name: '', displayOrder: 0, active: true });
    this.modal.set(true);
  }
  openEdit(i: Cycle) {
    this.error.set('');
    this.editing.set(i);
    this.form.reset({
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
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const r: CycleRequest = {
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
          this.success.set(
            e ? 'Modification enregistrée.' : 'Création effectuée.',
          );
          this.load();
        },
        error: (x) => this.fail(x, 'Enregistrement impossible.'),
      });
  }
  private fail(e: any, m: string) {
    console.error(e);
    this.error.set(e?.error?.message || m);
  }
}
