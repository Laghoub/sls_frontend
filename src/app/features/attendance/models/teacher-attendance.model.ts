export type TeacherAttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD';
export type AttendanceValidationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface ExpectedTeacherAttendance {
  classSessionId: number | null;
  scheduleEntryId: number;
  date: string;
  timeSlotId: number;
  timeSlotCode: string;
  startTime: string;
  endTime: string;
  teacherId: number;
  teacherName: string;
  classGroupId: number;
  classGroupName: string;
  subjectId: number;
  subjectName: string;
  roomId: number | null;
  roomName: string | null;
  attendanceId: number | null;
  attendanceStatus: TeacherAttendanceStatus | null;
  lateMinutes: number | null;
  reason: string | null;
  notes: string | null;
  validationStatus: AttendanceValidationStatus | null;
}

export interface TeacherAttendanceSaveRequest {
  scheduleEntryId: number;
  date: string;
  status: TeacherAttendanceStatus;
  lateMinutes: number | null;
  reason: string | null;
  notes: string | null;
}

export interface TeacherAttendanceBatchRequest {
  attendances: TeacherAttendanceSaveRequest[];
}

export interface TeacherAttendance {
  id: number;
  classSessionId: number;
  date: string;
  teacherId: number;
  teacherName: string;
  classGroupId: number;
  classGroupName: string;
  subjectId: number;
  subjectName: string;
  timeSlotId: number;
  timeSlotCode: string;
  startTime: string;
  endTime: string;
  attendanceStatus: TeacherAttendanceStatus;
  lateMinutes: number;
  reason: string | null;
  notes: string | null;
  validationStatus: AttendanceValidationStatus;
  recordedBy: string | null;
  recordedAt: string | null;
  validatedBy: string | null;
  validatedAt: string | null;
}

export interface TeacherAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  pending: number;
  validated: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AttendanceHistoryFilters {
  from?: string | null;
  to?: string | null;
  teacherId?: number | null;
  status?: TeacherAttendanceStatus | null;
  validationStatus?: AttendanceValidationStatus | null;
  page?: number;
  size?: number;
}
