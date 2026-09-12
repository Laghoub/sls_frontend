import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  CampusRef,
  ClassGroupRef,
  CycleRef,
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
  cycles = signal<CycleRef[]>([]);
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

  form: TariffRequest = this.emptyForm();

  constructor() {
    forkJoin({
      years: this.refs.schoolYears(),
      cycles: this.refs.cycles(),
      levels: this.refs.levels(),
      classes: this.refs.classGroups(),
      campuses: this.refs.campuses(),
      fees: this.fees.search('', 0, 100),
    }).subscribe({
      next: (r) => {
        this.years.set(r.years);
        this.cycles.set(r.cycles);
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

  private emptyForm(): TariffRequest {
    return {
      schoolYearId: 0,
      feeTypeId: 0,
      cycleId: null,
      levelId: null,
      classGroupId: null,
      campusId: null,
      amount: 0,
      billingFrequency: 'ONE_TIME',
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: null,
      active: true,
    };
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
      ...this.emptyForm(),
      schoolYearId: this.schoolYearId ?? this.years()[0]?.id ?? 0,
      feeTypeId: this.feeTypes()[0]?.id ?? 0,
    };
    this.modal.set(true);
  }

  openEdit(x: Tariff) {
    this.editing.set(x);
    this.form = {
      schoolYearId: x.schoolYearId,
      feeTypeId: x.feeTypeId,
      cycleId: x.cycleId,
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

  onCycleChange() {
    if (this.form.levelId) {
      const level = this.levels().find((x) => x.id === this.form.levelId);
      if (this.form.cycleId && level?.cycleId !== this.form.cycleId) {
        this.form.levelId = null;
        this.form.classGroupId = null;
      }
    }
  }

  onLevelChange() {
    if (this.form.levelId) {
      const level = this.levels().find((x) => x.id === this.form.levelId);
      if (level) this.form.cycleId = level.cycleId;
    }

    if (this.form.classGroupId) {
      const group = this.classes().find((x) => x.id === this.form.classGroupId);
      if (this.form.levelId && group?.levelId !== this.form.levelId) {
        this.form.classGroupId = null;
      }
    }
  }

  onClassChange() {
    if (!this.form.classGroupId) return;
    const group = this.classes().find((x) => x.id === this.form.classGroupId);
    if (!group) return;
    this.form.levelId = group.levelId;
    const level = this.levels().find((x) => x.id === group.levelId);
    this.form.cycleId = level?.cycleId ?? this.form.cycleId;
    this.form.campusId = group.campusId;
  }

  save() {
    this.error.set('');
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

  filteredLevels() {
    return this.form.cycleId
      ? this.levels().filter((x) => x.cycleId === this.form.cycleId)
      : this.levels();
  }

  filteredClasses() {
    return this.classes().filter((x) => {
      if (x.schoolYearId !== this.form.schoolYearId) return false;
      if (this.form.levelId && x.levelId !== this.form.levelId) return false;
      if (this.form.campusId && x.campusId !== this.form.campusId) return false;
      if (this.form.cycleId) {
        const level = this.levels().find((l) => l.id === x.levelId);
        if (level?.cycleId !== this.form.cycleId) return false;
      }
      return true;
    });
  }

  fee(id: number) {
    return this.feeTypes().find((x) => x.id === id)?.name ?? `Frais ${id}`;
  }

  year(id: number) {
    return this.years().find((x) => x.id === id)?.label ?? '—';
  }

  cycle(id: number | null) {
    if (!id) return null;
    return this.cycles().find((x) => x.id === id)?.name ?? `Cycle ${id}`;
  }

  scope(x: Tariff) {
    const parts: string[] = [];
    if (x.cycleId) parts.push(this.cycle(x.cycleId) ?? 'Cycle');
    if (x.levelId) parts.push(this.levels().find((l) => l.id === x.levelId)?.name ?? 'Niveau');
    if (x.classGroupId) parts.push(this.classes().find((c) => c.id === x.classGroupId)?.name ?? 'Classe');
    if (x.campusId) parts.push(this.campuses().find((c) => c.id === x.campusId)?.name ?? 'Campus');
    return parts.length ? parts.join(' · ') : 'Global';
  }

  frequency(value: string) {
    return ({
      ONE_TIME: 'Unique',
      MONTHLY: 'Mensuel',
      QUARTERLY: 'Trimestriel',
      ANNUAL: 'Annuel',
    } as Record<string, string>)[value] ?? value;
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
