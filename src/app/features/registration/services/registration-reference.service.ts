import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  ClassGroupRef,
  GuardianChoice,
  LevelRef,
  PersonRef,
  SchoolYearRef,
  StudentChoice,
} from '../models/reference.model';
interface StudentRaw {
  id: number;
  personId: number;
  studentNumber: string;
  status: string;
}
interface GuardianRaw {
  id: number;
  personId: number;
  status: string;
}
@Injectable({ providedIn: 'root' })
export class RegistrationReferenceService {
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
  students(search = '', page = 0, size = 10) {
    let p = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);
    return this.http
      .get<PageResponse<StudentRaw>>(`${this.base}/students`, { params: p })
      .pipe(
        switchMap((r) => {
          if (!r.content.length)
            return of({ ...r, content: [] } as PageResponse<StudentChoice>);
          return forkJoin(
            r.content.map((s) =>
              this.http
                .get<PersonRef>(`${this.base}/persons/${s.personId}`)
                .pipe(map((person) => ({ ...s, person }) as StudentChoice)),
            ),
          ).pipe(map((content) => ({ ...r, content })));
        }),
      );
  }
  guardians(search = '', page = 0, size = 10) {
    let p = new HttpParams()
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
