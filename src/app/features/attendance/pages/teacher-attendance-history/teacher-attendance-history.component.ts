import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import { HrService } from '../../../hr/services/hr.service';
import { Teacher } from '../../../hr/models/hr.model';
import {
  TeacherAttendance,
  TeacherAttendanceStatus,
  TeacherAttendanceSummary,
} from '../../models/teacher-attendance.model';
import { TeacherAttendanceService } from '../../services/teacher-attendance.service';

@Component({
  selector: 'app-teacher-attendance-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher-attendance-history.component.html',
  styleUrl: './teacher-attendance-history.component.scss',
})
export class TeacherAttendanceHistoryComponent implements OnInit {
  private readonly api = inject(TeacherAttendanceService);
  private readonly hr = inject(HrService);
  readonly auth = inject(AuthService);

  readonly teachers = signal<Teacher[]>([]);
  readonly items = signal<TeacherAttendance[]>([]);
  readonly loading = signal(false);
  readonly summary = signal<TeacherAttendanceSummary>({ total: 0, present: 0, absent: 0, late: 0, pending: 0, validated: 0 });
  readonly error = signal('');
  readonly message = signal('');

  from = '';
  to = '';
  teacherId: number | null = null;
  status: TeacherAttendanceStatus | null = null;
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;


  ngOnInit(): void {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    this.from = this.localDate(first);
    this.to = this.localDate(now);
    forkJoin({ teachers: this.hr.teachers() }).subscribe({ next: (r) => this.teachers.set(r.teachers) });
    this.load();
  }

  load(resetPage = false): void {
    if (resetPage) this.page = 0;
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      history: this.api.history({ from: this.from || null, to: this.to || null, teacherId: this.teacherId, status: this.status, page: this.page, size: this.size }),
      summary: this.api.summary(this.from || null, this.to || null, this.teacherId),
    }).subscribe({
      next: (r) => {
        this.items.set(r.history.content);
        this.page = r.history.page;
        this.totalElements = r.history.totalElements;
        this.totalPages = r.history.totalPages;
        this.summary.set(r.summary);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(this.errorText(e));
      },
    });
  }

  resetFilters(): void {
    this.teacherId = null;
    this.status = null;
    const now = new Date();
    this.from = this.localDate(new Date(now.getFullYear(), now.getMonth(), 1));
    this.to = this.localDate(now);
    this.load(true);
  }

  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.page + 1 < this.totalPages) { this.page++; this.load(); } }

  private localDate(d: Date): string {
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private errorText(e: any): string { return e?.error?.message ?? e?.error?.detail ?? e?.message ?? 'Une erreur est survenue.'; }
}
