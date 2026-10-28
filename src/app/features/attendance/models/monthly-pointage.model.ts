export interface MonthlyPointageFilters {
  from: string; to: string; schoolYearId?: number | null; cycle?: string;
  classId?: number | null; teacherId?: number | null; subjectId?: number | null;
}
export interface MonthlyPointageRow {
 teacherId: number; teacherName: string; classId: number; className: string;
 subjectId: number; subjectName: string; date: string; plannedHours: number;
 performedHours: number; status: string; sessionId: number;
}
export interface MonthlyPointageSummary {
 teacherId: number; teacherName: string; classId: number; className: string;
 hoursByDay: Record<string, number>; totalHours: number;
}
