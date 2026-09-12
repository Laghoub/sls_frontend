import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../../../core/api.config';
import { PageResponse } from '../models/page-response.model';
import {
  CampusRef,
  CycleRef,
  ClassGroupRef,
  EnrollmentChoice,
  GuardianChoice,
  LevelRef,
  PersonRef,
  RegistrationChoice,
  SchoolYearRef,
  StudentChoice,
} from '../models/finance-reference.model';

interface GuardianRaw {
  id: number;
  personId: number;
  status: string;
}

interface StudentRaw {
  id: number;
  personId: number;
  studentNumber: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceReferenceService {
  private http = inject(HttpClient);
  private base = API_CONFIG.baseUrl;

  cycles() {
    return this.http.get<CycleRef[]>(`${this.base}/cycles`);
  }

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

  /**
   * Les DTO Enrollment actuels ne contiennent pas encore le nom/prénom.
   * Pour l'interface Finance, on enrichit donc les scolarisations avec
   * Student -> Person et le libellé de classe, sans changer le backend.
   */
  enrollments(schoolYearId: number, page = 0, size = 20) {
    const p = new HttpParams()
      .set('schoolYearId', schoolYearId)
      .set('page', page)
      .set('size', size);

    return forkJoin({
      enrollments: this.http.get<PageResponse<EnrollmentChoice>>(
        `${this.base}/enrollments`,
        { params: p },
      ),
      classes: this.classGroups(),
    }).pipe(
      switchMap(({ enrollments, classes }) => {
        if (!enrollments.content.length) {
          return of(enrollments);
        }

        return forkJoin(
          enrollments.content.map((enrollment) =>
            this.http
              .get<StudentRaw>(`${this.base}/students/${enrollment.studentId}`)
              .pipe(
                switchMap((student) =>
                  this.http
                    .get<PersonRef>(`${this.base}/persons/${student.personId}`)
                    .pipe(
                      map((person) => ({
                        ...enrollment,
                        studentNumber:
                          enrollment.studentNumber || student.studentNumber,
                        studentLastName: person.lastName,
                        studentFirstName: person.firstName,
                        classGroupName:
                          classes.find(
                            (c) => c.id === enrollment.currentClassGroupId,
                          )?.name ?? null,
                      })),
                    ),
                ),
              ),
          ),
        ).pipe(
          map((content) => ({
            ...enrollments,
            content,
          })),
        );
      }),
    );
  }

  students(search = '', page = 0, size = 20) {
    const p = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);

    return this.http
      .get<PageResponse<StudentRaw>>(`${this.base}/students`, { params: p })
      .pipe(
        switchMap((r) => {
          if (!r.content.length) {
            return of({ ...r, content: [] } as PageResponse<StudentChoice>);
          }

          return forkJoin(
            r.content.map((student) =>
              this.http
                .get<PersonRef>(`${this.base}/persons/${student.personId}`)
                .pipe(map((person) => ({ ...student, person }) as StudentChoice)),
            ),
          ).pipe(map((content) => ({ ...r, content })));
        }),
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
          if (!r.content.length) {
            return of({ ...r, content: [] } as PageResponse<GuardianChoice>);
          }

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
