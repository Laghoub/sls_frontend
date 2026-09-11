import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  CampusRef,
  ClassGroupRef,
  LevelRef,
  SchoolYearRef,
} from '../../models/finance-reference.model';
import { FeeType, Tariff, TariffRequest } from '../../models/finance.model';
import { FeeTypeService } from '../../services/fee-type.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';
import { TariffService } from '../../services/tariff.service';
@Component({
  selector: 'app-tariffs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tariffs.component.html',
  styleUrl: './tariffs.component.scss',
})
export class TariffsComponent {
  private s = inject(TariffService);
  private refs = inject(FinanceReferenceService);
  private fees = inject(FeeTypeService);
  auth = inject(AuthService);
  items = signal<Tariff[]>([]);
  years = signal<SchoolYearRef[]>([]);
  levels = signal<LevelRef[]>([]);
  classes = signal<ClassGroupRef[]>([]);
  campuses = signal<CampusRef[]>([]);
  feeTypes = signal<FeeType[]>([]);
  page = signal(0);
  size = signal(20);
  total = signal(0);
  pages = signal(0);
  error = signal('');
  modal = signal(false);
  editing = signal<Tariff | null>(null);
  schoolYearId: number | null = null;
  form: TariffRequest = {
    schoolYearId: 0,
    feeTypeId: 0,
    levelId: null,
    classGroupId: null,
    campusId: null,
    amount: 0,
    billingFrequency: 'ONE_TIME',
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: null,
    active: true,
  };
  constructor() {
    forkJoin({
      years: this.refs.schoolYears(),
      levels: this.refs.levels(),
      classes: this.refs.classGroups(),
      campuses: this.refs.campuses(),
      fees: this.fees.search('', 0, 100),
    }).subscribe({
      next: (r) => {
        this.years.set(r.years);
        this.levels.set(r.levels);
        this.classes.set(r.classes);
        this.campuses.set(r.campuses);
        this.feeTypes.set(r.fees.content);
        this.schoolYearId = r.years.find((x) => x.currentYear)?.id ?? null;
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  load() {
    this.s.search(this.schoolYearId, this.page(), this.size()).subscribe({
      next: (r) => {
        this.items.set(r.content);
        this.total.set(r.totalElements);
        this.pages.set(r.totalPages);
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  openCreate() {
    this.editing.set(null);
    this.form = {
      schoolYearId: this.schoolYearId ?? this.years()[0]?.id ?? 0,
      feeTypeId: this.feeTypes()[0]?.id ?? 0,
      levelId: null,
      classGroupId: null,
      campusId: null,
      amount: 0,
      billingFrequency: 'ONE_TIME',
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: null,
      active: true,
    };
    this.modal.set(true);
  }
  openEdit(x: Tariff) {
    this.editing.set(x);
    this.form = {
      schoolYearId: x.schoolYearId,
      feeTypeId: x.feeTypeId,
      levelId: x.levelId,
      classGroupId: x.classGroupId,
      campusId: x.campusId,
      amount: x.amount,
      billingFrequency: x.billingFrequency,
      validFrom: x.validFrom,
      validUntil: x.validUntil,
      active: x.active,
    };
    this.modal.set(true);
  }
  save() {
    const op = this.editing()
      ? this.s.update(this.editing()!.id, this.form)
      : this.s.create(this.form);
    op.subscribe({
      next: () => {
        this.modal.set(false);
        this.load();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }
  fee(id: number) {
    return this.feeTypes().find((x) => x.id === id)?.name ?? `Frais ${id}`;
  }
  year(id: number) {
    return this.years().find((x) => x.id === id)?.label ?? '—';
  }
  scope(x: Tariff) {
    if (x.classGroupId)
      return (
        this.classes().find((c) => c.id === x.classGroupId)?.name ?? 'Classe'
      );
    if (x.levelId)
      return this.levels().find((l) => l.id === x.levelId)?.name ?? 'Niveau';
    if (x.campusId)
      return this.campuses().find((c) => c.id === x.campusId)?.name ?? 'Campus';
    return 'Global';
  }
  prev() {
    if (this.page() > 0) {
      this.page.update((v) => v - 1);
      this.load();
    }
  }
  next() {
    if (this.page() + 1 < this.pages()) {
      this.page.update((v) => v + 1);
      this.load();
    }
  }
  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
