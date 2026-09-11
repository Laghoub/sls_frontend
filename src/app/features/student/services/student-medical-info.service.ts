import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import {
  StudentMedicalInfo,
  StudentMedicalInfoRequest,
} from '../models/student-medical-info.model';
@Injectable({ providedIn: 'root' })
export class StudentMedicalInfoService {
  private http = inject(HttpClient);
  get(id: number): Observable<StudentMedicalInfo> {
    return this.http.get<StudentMedicalInfo>(
      `${API_CONFIG.baseUrl}/students/${id}/medical-info`,
    );
  }
  save(id: number, r: StudentMedicalInfoRequest) {
    return this.http.put<StudentMedicalInfo>(
      `${API_CONFIG.baseUrl}/students/${id}/medical-info`,
      r,
    );
  }
}
