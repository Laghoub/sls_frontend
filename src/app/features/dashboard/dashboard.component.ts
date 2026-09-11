import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../core/config/auth/services/auth.service';

import { SchoolYearService } from '../school/school-years/services/school-year.service';
import { CampusService } from '../school/campuses/services/campus.service';
import { ClassGroupService } from '../school/class-groups/services/class-group.service';
import { SchoolCalendarExceptionService } from '../school/calendar/services/school-calendar-exception.service';

import { SchoolYear } from '../school/school-years/models/school-year.model';
import { Campus } from '../school/campuses/models/campus.model';
import { ClassGroup } from '../school/class-groups/models/class-group.model';
import { StudentService } from '../student/services/student.service';
import { SchoolCalendarException } from '../school/calendar/models/school-calendar-exception.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  private readonly authService = inject(AuthService);
  private readonly studentService = inject(StudentService);
  private readonly schoolYearService = inject(SchoolYearService);
  private readonly campusService = inject(CampusService);
  private readonly classGroupService = inject(ClassGroupService);
  private readonly calendarService = inject(SchoolCalendarExceptionService);

  readonly currentUser = this.authService.currentUser;

  readonly loading = signal(true);
  studentCount = signal<number | null>(null);

  readonly currentSchoolYear = signal<SchoolYear | null>(null);

  readonly classCount = signal(0);
  readonly campusCount = signal(0);

  readonly calendarEvents = signal<SchoolCalendarException[]>([]);

  constructor() {
    this.loadDashboard();
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  loadStudentCount(): void {

  this.studentService
    .getPage(0, 1, '')
    .subscribe({

      next: response => {

        this.studentCount.set(
          response.totalElements
        );

      },

      error: error => {

        console.error(
          'Erreur chargement nombre élèves',
          error
        );

        this.studentCount.set(0);

      }

    });
}

  

  loadDashboard(): void {

    this.loading.set(true);

 this.loadStudentCount();

    const schoolYears$ =
      this.hasPermission('ANNEE_SCOLAIRE_CONSULTER')
        ? this.schoolYearService.getAll().pipe(
            catchError(() => of([] as SchoolYear[]))
          )
        : of([] as SchoolYear[]);

    const classes$ =
      this.hasPermission('CLASSE_CONSULTER')
        ? this.classGroupService.getAll().pipe(
            catchError(() => of([] as ClassGroup[]))
          )
        : of([] as ClassGroup[]);

    const campuses$ =
      this.hasPermission('CAMPUS_CONSULTER')
        ? this.campusService.getAll().pipe(
            catchError(() => of([] as Campus[]))
          )
        : of([] as Campus[]);

    const calendar$ =
      this.hasPermission('CALENDRIER_SCOLAIRE_CONSULTER')
        ? this.calendarService.getAll().pipe(
            catchError(() =>
              of([] as SchoolCalendarException[])
            )
          )
        : of([] as SchoolCalendarException[]);

    forkJoin({
      schoolYears: schoolYears$,
      classes: classes$,
      campuses: campuses$,
      calendar: calendar$
    }).subscribe({

      next: data => {

        /*
         * Année scolaire courante
         */
        const currentYear =
          data.schoolYears.find(
            year => year.currentYear
          ) ?? null;

        this.currentSchoolYear.set(currentYear);

        /*
         * Statistiques
         */
        this.classCount.set(
          data.classes.length
        );

        this.campusCount.set(
          data.campuses.filter(
            campus => campus.active
          ).length
        );

        /*
         * Calendrier
         *
         * On affiche les événements
         * les plus proches en premier.
         */
        const events = [...data.calendar]
          .sort(
            (a, b) =>
              new Date(a.exceptionDate).getTime()
              -
              new Date(b.exceptionDate).getTime()
          )
          .slice(0, 5);

        this.calendarEvents.set(events);

        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      }

    });
  }

  formatExceptionType(type: string): string {

    if (!type) {
      return 'Événement';
    }

    return type
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(
        /^\w/,
        character => character.toUpperCase()
      );
  }
}