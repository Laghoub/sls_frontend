import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { TimeSlot } from '../../../school/time-slots/models/time-slot.model';
import { TimeSlotService } from '../../../school/time-slots/services/time-slot.service';
import {
  ExpectedTeacherAttendance,
  TeacherAttendanceStatus,
} from '../../models/teacher-attendance.model';
import { TeacherAttendanceService } from '../../services/teacher-attendance.service';

interface AttendanceRow extends ExpectedTeacherAttendance {
  editStatus: TeacherAttendanceStatus;
  editLateMinutes: number | null;
  editReason: string;
  editNotes: string;
}

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher-attendance.component.html',
  styleUrl: './teacher-attendance.component.scss',
})
export class TeacherAttendanceComponent implements OnInit {
  private readonly api = inject(TeacherAttendanceService);
  private readonly timeSlotApi = inject(TimeSlotService);
  readonly auth = inject(AuthService);

  readonly timeSlots = signal<TimeSlot[]>([]);
  readonly rows = signal<AttendanceRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  selectedDate = this.localToday();
  selectedTimeSlotId: number | null = null;

  ngOnInit(): void {
    this.loading.set(true);
    this.timeSlotApi.getAll().subscribe({
      next: (slots) => {
        const active = slots.filter((x) => x.active).sort((a, b) => a.displayOrder - b.displayOrder);
        this.timeSlots.set(active);
        this.selectedTimeSlotId = active[0]?.id ?? null;
        this.loading.set(false);
        if (this.selectedTimeSlotId) this.loadExpected();
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.errorText(e));
      },
    });
  }

  loadExpected(): void {
    this.message.set('');
    this.error.set('');
    if (!this.selectedDate || !this.selectedTimeSlotId) {
      this.rows.set([]);
      return;
    }
    this.loading.set(true);
    this.api.expected(this.selectedDate, this.selectedTimeSlotId).subscribe({
      next: (items) => {
        this.rows.set(items.map((x) => this.toRow(x)));
        this.loading.set(false);
      },
      error: (e) => {
        this.rows.set([]);
        this.loading.set(false);
        this.error.set(this.errorText(e));
      },
    });
  }

  setStatus(row: AttendanceRow, status: TeacherAttendanceStatus): void {
    row.editStatus = status;
    if (status !== 'RETARD') row.editLateMinutes = 0;
    if (status === 'PRESENT') row.editReason = '';
  }

  save(): void {
    this.message.set('');
    this.error.set('');
    const rows = this.rows();
    if (!rows.length) return;

    const invalidLate = rows.find((r) => r.editStatus === 'RETARD' && (!r.editLateMinutes || r.editLateMinutes <= 0));
    if (invalidLate) {
      this.error.set(`Indiquez le nombre de minutes de retard pour ${invalidLate.teacherName}.`);
      return;
    }

    this.saving.set(true);
    this.api.saveBatch({
      attendances: rows.map((r) => ({
        scheduleEntryId: r.scheduleEntryId,
        date: this.selectedDate,
        status: r.editStatus,
        lateMinutes: r.editStatus === 'RETARD' ? r.editLateMinutes : 0,
        reason: r.editReason.trim() || null,
        notes: r.editNotes.trim() || null,
      })),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Assiduité enregistrée avec succès.');
        this.loadExpected();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(this.errorText(e));
      },
    });
  }

  countStatus(status: TeacherAttendanceStatus): number {
    return this.rows().filter((r) => r.editStatus === status).length;
  }

  private toRow(x: ExpectedTeacherAttendance): AttendanceRow {
    return {
      ...x,
      editStatus: x.attendanceStatus ?? 'PRESENT',
      editLateMinutes: x.lateMinutes ?? 0,
      editReason: x.reason ?? '',
      editNotes: x.notes ?? '',
    };
  }

  private localToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private errorText(e: any): string {
    return e?.error?.message ?? e?.error?.detail ?? e?.message ?? 'Une erreur est survenue.';
  }
}
