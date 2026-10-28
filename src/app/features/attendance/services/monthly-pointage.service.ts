import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import { MonthlyPointageFilters, MonthlyPointageRow, MonthlyPointageSummary } from '../models/monthly-pointage.model';
@Injectable({ providedIn: 'root' })
export class MonthlyPointageService {
 private readonly http = inject(HttpClient);
 private readonly url = `${API_CONFIG.baseUrl}/teacher-attendance/monthly`;
 private params(f: MonthlyPointageFilters): HttpParams {
   let p = new HttpParams().set('from', f.from).set('to', f.to);
   if (f.schoolYearId != null) p = p.set('schoolYearId', f.schoolYearId);
   if (f.cycle) p = p.set('cycle', f.cycle);
   if (f.classId != null) p = p.set('classId', f.classId);
   if (f.teacherId != null) p = p.set('teacherId', f.teacherId);
   if (f.subjectId != null) p = p.set('subjectId', f.subjectId);
   return p;
 }
 summary(f: MonthlyPointageFilters) { return this.http.get<MonthlyPointageSummary[]>(`${this.url}/summary`, { params: this.params(f) }); }
 details(f: MonthlyPointageFilters) { return this.http.get<MonthlyPointageRow[]>(this.url, { params: this.params(f) }); }
 exportPdf(f: MonthlyPointageFilters) { return this.http.get(`${this.url}/export.pdf`, { params: this.params(f), responseType: 'blob' }); }
 exportCsv(f: MonthlyPointageFilters) { return this.http.get(`${this.url}/export.csv`, { params: this.params(f), responseType: 'blob' }); }
}
