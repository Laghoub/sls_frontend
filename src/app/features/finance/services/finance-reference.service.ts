import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  CampusRef,
  ClassGroupRef,
  EnrollmentChoice,
  GuardianChoice,
  LevelRef,
  PersonRef,
  RegistrationChoice,
  SchoolYearRef,
} from '../models/finance-reference.model';
interface GuardianRaw {
  id: number;
  personId: number;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class FinanceReferenceService {
  private http = inject(HttpClient);
  private base = API_CONFIG.baseUrl;
  schoolYears() {
    return this.http.get<SchoolYearRef[]>(`${this.base}/school-years`);
  }
  levels() {
    return this.http.get<LevelRef[]>(`${this.base}/levels`);
  }
  classGroups() {
    return this.http.get<ClassGroupRef[]>(`${this.base}/class-groups`);
  }
  campuses() {
    return this.http.get<CampusRef[]>(`${this.base}/campuses`);
  }
  registrations(
    search = '',
    schoolYearId: number | null = null,
    status: string | null = null,
    page = 0,
    size = 10,
  ) {
    let p = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);
    if (schoolYearId != null) p = p.set('schoolYearId', schoolYearId);
    if (status) p = p.set('status', status);
    return this.http.get<PageResponse<RegistrationChoice>>(
      `${this.base}/registrations`,
      { params: p },
    );
  }
  enrollments(schoolYearId: number, page = 0, size = 20) {
    const p = new HttpParams()
      .set('schoolYearId', schoolYearId)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<EnrollmentChoice>>(
      `${this.base}/enrollments`,
      { params: p },
    );
  }
  guardians(search = '', page = 0, size = 10) {
    const p = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<GuardianRaw>>(`${this.base}/guardians`, { params: p })
      .pipe(
        switchMap((r) => {
          if (!r.content.length)
            return of({ ...r, content: [] } as PageResponse<GuardianChoice>);
          return forkJoin(
            r.content.map((g) =>
              this.http
                .get<PersonRef>(`${this.base}/persons/${g.personId}`)
                .pipe(map((person) => ({ ...g, person }) as GuardianChoice)),
            ),
          ).pipe(map((content) => ({ ...r, content })));
        }),
      );
  }
}
