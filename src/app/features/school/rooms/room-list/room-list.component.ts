import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { RoomService } from '../services/room.service';
import { Room, RoomRequest } from '../models/room.model';
import { CampusService } from '../../campuses/services/campus.service';
import { Campus } from '../../campuses/models/campus.model';
@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss',
})
export class RoomListComponent {
  private fb = inject(FormBuilder);
  private svc = inject(RoomService);
  private refSvc = inject(CampusService);
  private auth = inject(AuthService);
  items = signal<Room[]>([]);
  refs = signal<Campus[]>([]);
  loading = signal(false);
  saving = signal(false);
  modal = signal(false);
  editing = signal<Room | null>(null);
  error = signal('');
  success = signal('');
  form = this.fb.nonNullable.group({
    campusId: [0, [Validators.required, Validators.min(1)]],
    code: ['', Validators.required],
    name: ['', Validators.required],
    capacity: [0],
    roomType: [''],
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
    return this.auth.hasPermission('SALLE_CREER');
  }
  canEdit() {
    return this.auth.hasPermission('SALLE_MODIFIER');
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
      campusId: 0,
      code: '',
      name: '',
      capacity: 0,
      roomType: '',
      active: true,
    });
    this.modal.set(true);
  }
  openEdit(i: Room) {
    this.editing.set(i);
    this.form.reset({
      campusId: i.campusId,
      code: i.code,
      name: i.name,
      capacity: i.capacity ?? 0,
      roomType: i.roomType ?? '',
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
    const r: RoomRequest = {
      campusId: Number(v.campusId),
      code: v.code.trim(),
      name: v.name.trim(),
      capacity: v.capacity ? Number(v.capacity) : null,
      roomType: v.roomType.trim() || null,
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
