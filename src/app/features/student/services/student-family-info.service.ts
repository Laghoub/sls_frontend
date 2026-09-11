import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import {
  StudentFamilyInfo,
  StudentFamilyInfoRequest,
} from '../models/student-family-info.model';
@Injectable({ providedIn: 'root' })
export class StudentFamilyInfoService {
  private http = inject(HttpClient);
  get(id: number): Observable<StudentFamilyInfo> {
    return this.http.get<StudentFamilyInfo>(
      `${API_CONFIG.baseUrl}/students/${id}/family-info`,
    );
  }
  save(id: number, r: StudentFamilyInfoRequest) {
    return this.http.put<StudentFamilyInfo>(
      `${API_CONFIG.baseUrl}/students/${id}/family-info`,
      r,
    );
  }
}
