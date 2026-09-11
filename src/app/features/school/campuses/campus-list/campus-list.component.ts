import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { CampusService } from '../services/campus.service';
import { Campus, CampusRequest } from '../models/campus.model';
@Component({
  selector: 'app-campus-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './campus-list.component.html',
  styleUrl: './campus-list.component.scss',
})
export class CampusListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(CampusService);
  private auth = inject(AuthService);
  items = signal<Campus[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<Campus | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    address: [''],
    phone: [''],
    active: [true],
  });
  constructor() {
    this.load();
  }
  canCreate() {
    return this.auth.hasPermission('CAMPUS_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('CAMPUS_MODIFIER');
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
    this.form.reset({
      code: '',
      name: '',
      address: '',
      phone: '',
      active: true,
    });
    this.modal.set(true);
  }
  openEdit(i: Campus) {
    this.error.set('');
    this.editing.set(i);
    this.form.reset({
      code: i.code,
      name: i.name,
      address: i.address ?? '',
      phone: i.phone ?? '',
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
    const r: CampusRequest = {
      code: v.code.trim(),
      name: v.name.trim(),
      address: v.address.trim() || null,
      phone: v.phone.trim() || null,
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
