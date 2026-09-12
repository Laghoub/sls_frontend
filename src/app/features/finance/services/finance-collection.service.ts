import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  GuardianStudentChoice,
  StudentOpenCharge,
} from '../models/finance-collection.model';
import {
  AutomaticAllocationRequest,
  AutomaticAllocationResponse,
} from '../models/automatic-allocation.model';

@Injectable({ providedIn: 'root' })
export class FinanceCollectionService {
  private http = inject(HttpClient);
  private base = `${API_CONFIG.baseUrl}/finance/collection`;

  students(guardianId: number) {
    return this.http.get<GuardianStudentChoice[]>(
      `${this.base}/guardians/${guardianId}/students`,
    );
  }

  openCharges(
    guardianId: number,
    studentId: number,
    schoolYearId: number | null = null,
  ) {
    let params = new HttpParams();
    if (schoolYearId != null) {
      params = params.set('schoolYearId', schoolYearId);
    }

    return this.http.get<StudentOpenCharge[]>(
      `${this.base}/guardians/${guardianId}/students/${studentId}/open-charges`,
      { params },
    );
  }

  automaticAllocationPreview(request: AutomaticAllocationRequest) {
    return this.http.post<AutomaticAllocationResponse>(
      `${this.base}/automatic-allocation/preview`,
      request,
    );
  }

}
