import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import {
  StudentGuardian,
  StudentGuardianRequest,
} from '../models/student-guardian.model';
@Injectable({ providedIn: 'root' })
export class StudentGuardianService {
  private http = inject(HttpClient);
  private url = `${API_CONFIG.baseUrl}/student-guardians`;
  getByStudent(id: number): Observable<StudentGuardian[]> {
    return this.http.get<StudentGuardian[]>(`${this.url}/student/${id}`);
  }
  create(id: number, r: StudentGuardianRequest) {
    return this.http.post<StudentGuardian>(`${this.url}/student/${id}`, r);
  }
  update(id: number, r: StudentGuardianRequest) {
    return this.http.put<StudentGuardian>(`${this.url}/${id}`, r);
  }
}
