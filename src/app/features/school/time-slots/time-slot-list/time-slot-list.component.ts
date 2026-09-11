import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { TimeSlotService } from '../services/time-slot.service';
import { TimeSlot, TimeSlotRequest } from '../models/time-slot.model';
@Component({
  selector: 'app-time-slot-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './time-slot-list.component.html',
  styleUrl: './time-slot-list.component.scss',
})
export class TimeSlotListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(TimeSlotService);
  private auth = inject(AuthService);
  items = signal<TimeSlot[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<TimeSlot | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    displayOrder: [0, Validators.required],
    active: [true],
  });
  constructor() {
    this.load();
  }
  canCreate() {
    return this.auth.hasPermission('CRENEAU_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('CRENEAU_MODIFIER');
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
      startTime: '',
      endTime: '',
      displayOrder: 0,
      active: true,
    });
    this.modal.set(true);
  }
  openEdit(i: TimeSlot) {
    this.error.set('');
    this.editing.set(i);
    this.form.reset({
      code: i.code,
      startTime: i.startTime.substring(0, 5),
      endTime: i.endTime.substring(0, 5),
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
    if (v.endTime <= v.startTime) {
      this.error.set(
        'L’heure de fin doit être postérieure à l’heure de début.',
      );
      return;
    }
    const r: TimeSlotRequest = {
      code: v.code.trim(),
      startTime: v.startTime,
      endTime: v.endTime,
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
