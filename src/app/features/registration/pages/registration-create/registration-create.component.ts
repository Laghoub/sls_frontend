import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ClassGroupRef,
  GuardianChoice,
  LevelRef,
  SchoolYearRef,
  StudentChoice,
} from '../../models/reference.model';
import { RegistrationCaseService } from '../../services/registration-case.service';
import { RegistrationReferenceService } from '../../services/registration-reference.service';
@Component({
  selector: 'app-registration-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration-create.component.html',
  styleUrl: './registration-create.component.scss',
})
export class RegistrationCreateComponent {
  private service = inject(RegistrationCaseService);
  private refs = inject(RegistrationReferenceService);
  private router = inject(Router);
  years = signal<SchoolYearRef[]>([]);
  levels = signal<LevelRef[]>([]);
  classes = signal<ClassGroupRef[]>([]);
  students = signal<StudentChoice[]>([]);
  guardians = signal<GuardianChoice[]>([]);
  studentSearch = '';
  guardianSearch = '';
  studentId: number | null = null;
  guardianId: number | null = null;
  schoolYearId: number | null = null;
  levelId: number | null = null;
  classGroupId: number | null = null;
  registrationDate = new Date().toISOString().slice(0, 10);
  saving = signal(false);
  error = signal('');
  constructor() {
    this.refs.schoolYears().subscribe((v) => {
      this.years.set(v);
      this.schoolYearId = v.find((x) => x.currentYear)?.id ?? v[0]?.id ?? null;
    });
    this.refs
      .levels()
      .subscribe((v) => this.levels.set(v.filter((x) => x.active)));
    this.refs.classGroups().subscribe((v) => this.classes.set(v));
    this.searchStudents();
    this.searchGuardians();
  }
  searchStudents() {
    this.refs
      .students(this.studentSearch, 0, 10)
      .subscribe((r) => this.students.set(r.content));
  }
  searchGuardians() {
    this.refs
      .guardians(this.guardianSearch, 0, 10)
      .subscribe((r) => this.guardians.set(r.content));
  }
  availableClasses() {
    return this.classes().filter(
      (c) =>
        (!this.schoolYearId || c.schoolYearId === this.schoolYearId) &&
        (!this.levelId || c.levelId === this.levelId),
    );
  }
  save() {
    if (
      !this.schoolYearId ||
      !this.studentId ||
      !this.guardianId ||
      !this.levelId
    ) {
      this.error.set(
        'Année scolaire, élève, responsable et niveau sont obligatoires.',
      );
      return;
    }
    this.saving.set(true);
    this.service
      .create({
        schoolYearId: this.schoolYearId,
        studentId: this.studentId,
        guardianId: this.guardianId,
        requestedLevelId: this.levelId,
        requestedClassGroupId: this.classGroupId,
        registrationDate: this.registrationDate || null,
      })
      .subscribe({
        next: (r) => this.router.navigate(['/registration', r.id]),
        error: (e) => {
          this.error.set(
            e?.error?.message ?? 'Impossible de créer la pré-inscription.',
          );
          this.saving.set(false);
        },
      });
  }
}
