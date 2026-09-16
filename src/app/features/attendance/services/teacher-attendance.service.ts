import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  AttendanceHistoryFilters,
  ExpectedTeacherAttendance,
  PageResponse,
  TeacherAttendance,
  TeacherAttendanceBatchRequest,
  TeacherAttendanceSummary,
} from '../models/teacher-attendance.model';

@Injectable({ providedIn: 'root' })
export class TeacherAttendanceService {
  private readonly http = inject(HttpClient);
  private readonly root = `${API_CONFIG.baseUrl}/teacher-attendance`;

  expected(date: string, timeSlotId: number) {
    const params = new HttpParams().set('date', date).set('timeSlotId', timeSlotId);
    return this.http.get<ExpectedTeacherAttendance[]>(`${this.root}/expected`, { params });
  }

  saveBatch(request: TeacherAttendanceBatchRequest) {
    return this.http.put<TeacherAttendance[]>(`${this.root}/batch`, request);
  }

  history(filters: AttendanceHistoryFilters) {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.validationStatus) params = params.set('validationStatus', filters.validationStatus);
    return this.http.get<PageResponse<TeacherAttendance>>(this.root, { params });
  }

  summary(from?: string | null, to?: string | null, teacherId?: number | null) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (teacherId) params = params.set('teacherId', teacherId);
    return this.http.get<TeacherAttendanceSummary>(`${this.root}/summary`, { params });
  }

  validate(id: number) {
    return this.http.patch<TeacherAttendance>(`${this.root}/${id}/validate`, {});
  }

  reject(id: number) {
    return this.http.patch<TeacherAttendance>(`${this.root}/${id}/reject`, {});
  }

  reopen(id: number) {
    return this.http.patch<TeacherAttendance>(`${this.root}/${id}/reopen`, {});
  }
}
