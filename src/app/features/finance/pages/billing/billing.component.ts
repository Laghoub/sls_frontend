import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  BillingPreview,
  BillingTargetType,
  TariffBillingRequest,
} from '../../models/billing.model';
import {
  CampusRef,
  ClassGroupRef,
  CycleRef,
  LevelRef,
  SchoolYearRef,
  StudentChoice,
} from '../../models/finance-reference.model';
import { FeeType, Tariff } from '../../models/finance.model';
import { FeeTypeService } from '../../services/fee-type.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { TariffBillingService } from '../../services/tariff-billing.service';
import { TariffService } from '../../services/tariff.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
})
export class BillingComponent {
  private billing = inject(TariffBillingService);
  private tariffsApi = inject(TariffService);
  private refs = inject(FinanceReferenceService);
  private feesApi = inject(FeeTypeService);
  auth = inject(AuthService);

  years = signal<SchoolYearRef[]>([]);
  cycles = signal<CycleRef[]>([]);
  levels = signal<LevelRef[]>([]);
  classes = signal<ClassGroupRef[]>([]);
  campuses = signal<CampusRef[]>([]);
  feeTypes = signal<FeeType[]>([]);
  tariffs = signal<Tariff[]>([]);

  studentResults = signal<StudentChoice[]>([]);
  selectedStudents = signal<StudentChoice[]>([]);
  preview = signal<BillingPreview | null>(null);

  loadingTariffs = signal(false);
  loadingPreview = signal(false);
  creating = signal(false);
  error = signal('');
  success = signal('');

  schoolYearId: number | null = null;
  tariffId: number | null = null;
  targetType: BillingTargetType = 'STUDENT';
  readonly targetOptions: { value: BillingTargetType; label: string; icon: string }[] = [
    { value: 'STUDENT', label: 'Un élève', icon: 'bi bi-person' },
    { value: 'SELECTED_STUDENTS', label: 'Plusieurs élèves', icon: 'bi bi-people' },
    { value: 'CLASS_GROUP', label: 'Une classe', icon: 'bi bi-person-video3' },
    { value: 'LEVEL', label: 'Un niveau', icon: 'bi bi-layers' },
    { value: 'CYCLE', label: 'Un cycle', icon: 'bi bi-diagram-3' },
  ];
  targetId: number | null = null;
  dueDate: string | null = null;
  studentSearch = '';

  constructor() {
    forkJoin({
      years: this.refs.schoolYears(),
      cycles: this.refs.cycles(),
      levels: this.refs.levels(),
      classes: this.refs.classGroups(),
      campuses: this.refs.campuses(),
      fees: this.feesApi.search('', 0, 100),
    }).subscribe({
      next: (r) => {
        this.years.set(r.years);
        this.cycles.set(r.cycles);
        this.levels.set(r.levels);
        this.classes.set(r.classes);
        this.campuses.set(r.campuses);
        this.feeTypes.set(r.fees.content);
        this.schoolYearId = r.years.find((x) => x.currentYear)?.id ?? r.years[0]?.id ?? null;
        this.loadTariffs();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  loadTariffs() {
    this.preview.set(null);
    this.tariffId = null;
    this.targetId = null;
    this.selectedStudents.set([]);
    this.loadingTariffs.set(true);
    this.error.set('');

    this.tariffsApi.search(this.schoolYearId, 0, 100).subscribe({
      next: (r) => {
        this.tariffs.set(r.content.filter((x) => x.active));
        this.loadingTariffs.set(false);
      },
      error: (e) => {
        this.loadingTariffs.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  selectedTariff() {
    return this.tariffs().find((x) => x.id === this.tariffId) ?? null;
  }

  onTariffChange() {
    this.preview.set(null);
    this.success.set('');
    this.targetId = null;
    this.selectedStudents.set([]);

    const tariff = this.selectedTariff();
    if (!tariff) return;

    if (tariff.classGroupId) {
      this.targetType = 'CLASS_GROUP';
      this.targetId = tariff.classGroupId;
    } else if (tariff.levelId) {
      this.targetType = 'LEVEL';
      this.targetId = tariff.levelId;
    } else if (tariff.cycleId) {
      this.targetType = 'CYCLE';
      this.targetId = tariff.cycleId;
    } else {
      this.targetType = 'STUDENT';
    }
  }

  onTargetTypeChange() {
    this.preview.set(null);
    this.targetId = null;
    this.selectedStudents.set([]);
    this.studentResults.set([]);
    this.studentSearch = '';

    const tariff = this.selectedTariff();
    if (!tariff) return;

    if (this.targetType === 'CLASS_GROUP' && tariff.classGroupId) this.targetId = tariff.classGroupId;
    if (this.targetType === 'LEVEL' && tariff.levelId) this.targetId = tariff.levelId;
    if (this.targetType === 'CYCLE' && tariff.cycleId) this.targetId = tariff.cycleId;
  }

  searchStudents() {
    const q = this.studentSearch.trim();
    if (!q) {
      this.studentResults.set([]);
      return;
    }

    this.error.set('');
    this.refs.students(q, 0, 20).subscribe({
      next: (r) => this.studentResults.set(r.content),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  chooseStudent(student: StudentChoice) {
    if (this.targetType === 'STUDENT') {
      this.targetId = student.id;
      this.selectedStudents.set([student]);
      this.studentResults.set([]);
      return;
    }

    if (!this.selectedStudents().some((x) => x.id === student.id)) {
      this.selectedStudents.update((items) => [...items, student]);
    }
    this.studentResults.set([]);
    this.studentSearch = '';
  }

  removeStudent(id: number) {
    this.selectedStudents.update((items) => items.filter((x) => x.id !== id));
    if (this.targetType === 'STUDENT' && this.targetId === id) this.targetId = null;
    this.preview.set(null);
  }

  filteredCycles() {
    const tariff = this.selectedTariff();
    if (tariff?.cycleId) return this.cycles().filter((x) => x.id === tariff.cycleId);
    return this.cycles().filter((x) => x.active);
  }

  filteredLevels() {
    const tariff = this.selectedTariff();
    return this.levels().filter((x) => {
      if (!x.active) return false;
      if (tariff?.cycleId && x.cycleId !== tariff.cycleId) return false;
      if (tariff?.levelId && x.id !== tariff.levelId) return false;
      return true;
    });
  }

  filteredClasses() {
    const tariff = this.selectedTariff();
    return this.classes().filter((x) => {
      if (this.schoolYearId && x.schoolYearId !== this.schoolYearId) return false;
      if (tariff?.classGroupId && x.id !== tariff.classGroupId) return false;
      if (tariff?.levelId && x.levelId !== tariff.levelId) return false;
      if (tariff?.campusId && x.campusId !== tariff.campusId) return false;
      if (tariff?.cycleId) {
        const level = this.levels().find((l) => l.id === x.levelId);
        if (level?.cycleId !== tariff.cycleId) return false;
      }
      return true;
    });
  }

  request(): TariffBillingRequest | null {
    if (!this.tariffId) return null;

    if (this.targetType === 'SELECTED_STUDENTS') {
      const ids = this.selectedStudents().map((x) => x.id);
      if (!ids.length) return null;
      return {
        tariffId: this.tariffId,
        targetType: this.targetType,
        targetId: null,
        studentIds: ids,
        dueDate: this.isOneTime() ? this.dueDate : null,
      };
    }

    if (!this.targetId) return null;

    return {
      tariffId: this.tariffId,
      targetType: this.targetType,
      targetId: this.targetId,
      studentIds: [],
      dueDate: this.isOneTime() ? this.dueDate : null,
    };
  }

  canPreview() {
    return !!this.request();
  }

  previewBilling() {
    const request = this.request();
    if (!request) return;

    this.loadingPreview.set(true);
    this.error.set('');
    this.success.set('');
    this.preview.set(null);

    this.billing.preview(request).subscribe({
      next: (result) => {
        this.preview.set(result);
        this.loadingPreview.set(false);
      },
      error: (e) => {
        this.loadingPreview.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  createBilling() {
    const request = this.request();
    const preview = this.preview();
    if (!request || !preview || preview.chargeCount <= 0) return;

    this.creating.set(true);
    this.error.set('');
    this.success.set('');

    this.billing.create(request).subscribe({
      next: (result) => {
        this.creating.set(false);
        this.success.set(
          `${result.createdCount} créance(s) créée(s) pour ${this.money(result.createdAmount)}. ${result.skippedCount} doublon(s) ignoré(s).`,
        );
        this.previewBilling();
      },
      error: (e) => {
        this.creating.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  feeName(id: number) {
    return this.feeTypes().find((x) => x.id === id)?.name ?? `Frais ${id}`;
  }

  yearName(id: number) {
    return this.years().find((x) => x.id === id)?.label ?? `Année ${id}`;
  }

  cycleName(id: number | null) {
    if (!id) return 'Tous les cycles';
    return this.cycles().find((x) => x.id === id)?.name ?? `Cycle ${id}`;
  }

  levelName(id: number | null) {
    if (!id) return 'Tous les niveaux';
    return this.levels().find((x) => x.id === id)?.name ?? `Niveau ${id}`;
  }

  className(id: number | null) {
    if (!id) return 'Toutes les classes';
    return this.classes().find((x) => x.id === id)?.name ?? `Classe ${id}`;
  }

  campusName(id: number | null) {
    if (!id) return 'Tous les campus';
    return this.campuses().find((x) => x.id === id)?.name ?? `Campus ${id}`;
  }

  frequency(value: string | null | undefined) {
    return ({
      ONE_TIME: 'Unique',
      MONTHLY: 'Mensuel',
      QUARTERLY: 'Trimestriel',
      ANNUAL: 'Annuel',
    } as Record<string, string>)[value ?? ''] ?? value ?? '—';
  }

  isOneTime() {
    const f = this.selectedTariff()?.billingFrequency?.toUpperCase();
    return !f || f === 'ONE_TIME' || f === 'ANNUAL';
  }

  targetLabel() {
    return ({
      STUDENT: 'Un élève',
      SELECTED_STUDENTS: 'Plusieurs élèves',
      CLASS_GROUP: 'Une classe',
      LEVEL: 'Un niveau',
      CYCLE: 'Un cycle',
    } as Record<BillingTargetType, string>)[this.targetType];
  }

  studentLabel(student: StudentChoice) {
    const name = student.person
      ? `${student.person.lastName} ${student.person.firstName}`
      : `Élève #${student.id}`;
    return `${name} · ${student.studentNumber}`;
  }

  money(value: number) {
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0)} DA`;
  }

  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
