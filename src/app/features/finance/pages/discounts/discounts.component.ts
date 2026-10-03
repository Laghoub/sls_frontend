import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../core/config/auth/services/auth.service';
import {
  DiscountRule,
  DiscountRuleRequest,
  DiscountType,
  StudentDiscount,
  StudentDiscountRequest,
} from '../../models/discount.model';
import {
  CampusRef,
  ClassGroupRef,
  CycleRef,
  EnrollmentChoice,
  RegistrationChoice,
  LevelRef,
  SchoolYearRef,
} from '../../models/finance-reference.model';
import { FeeType } from '../../models/finance.model';
import { DiscountRuleService } from '../../services/discount-rule.service';
import { DiscountService } from '../../services/discount.service';
import { FeeTypeService } from '../../services/fee-type.service';
import { FinanceReferenceService } from '../../services/finance-reference.service';

@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.scss',
})
export class DiscountsComponent {
  private discounts = inject(DiscountService);
  private rulesService = inject(DiscountRuleService);
  private refs = inject(FinanceReferenceService);
  private feesService = inject(FeeTypeService);
  auth = inject(AuthService);

  activeTab: 'REQUESTS' | 'RULES' = 'REQUESTS';

  years = signal<SchoolYearRef[]>([]);
  cycles = signal<CycleRef[]>([]);
  levels = signal<LevelRef[]>([]);
  classes = signal<ClassGroupRef[]>([]);
  campuses = signal<CampusRef[]>([]);
  feeTypes = signal<FeeType[]>([]);
  enrollments = signal<EnrollmentChoice[]>([]);
  registrations = signal<RegistrationChoice[]>([]);
  items = signal<StudentDiscount[]>([]);
  rules = signal<DiscountRule[]>([]);

  error = signal('');
  success = signal('');
  loading = signal(false);
  saving = signal(false);
  applyingRuleId = signal<number | null>(null);
  modal = signal(false);
  ruleModal = signal(false);
  rejectModal = signal(false);
  editingRule = signal<DiscountRule | null>(null);
  selectedForReject = signal<StudentDiscount | null>(null);

  page = signal(0);
  pages = signal(0);
  total = signal(0);
  size = 20;
  filterStatus = '';
  schoolYearId: number | null = null;
  enrollmentSearch = '';
  selectedTarget = '';
  rejectionReason = '';

  form: StudentDiscountRequest = this.emptyDiscountForm();
  ruleForm: DiscountRuleRequest = this.emptyRuleForm();

  constructor() {
    forkJoin({
      years: this.refs.schoolYears(),
      cycles: this.refs.cycles(),
      levels: this.refs.levels(),
      classes: this.refs.classGroups(),
      campuses: this.refs.campuses(),
      fees: this.feesService.search('', 0, 100),
    }).subscribe({
      next: (r) => {
        this.years.set(r.years);
        this.cycles.set(r.cycles);
        this.levels.set(r.levels);
        this.classes.set(r.classes);
        this.campuses.set(r.campuses);
        this.feeTypes.set(r.fees.content.filter((x) => x.active));
        this.schoolYearId = r.years.find((x) => x.currentYear)?.id ?? r.years[0]?.id ?? null;
        this.loadEnrollments();
        this.loadRequests();
        this.loadRules();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  private emptyDiscountForm(): StudentDiscountRequest {
    return {
      studentEnrollmentId: null,
      registrationCaseId: null,
      feeTypeId: null,
      discountType: 'PERCENTAGE',
      value: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      reason: null,
    };
  }

  private emptyRuleForm(): DiscountRuleRequest {
    return {
      schoolYearId: 0,
      code: '',
      name: '',
      discountType: 'PERCENTAGE',
      value: 0,
      feeTypeId: null,
      priority: 0,
      requiresApproval: false,
      active: true,
      validFrom: null,
      validUntil: null,
      conditionType: 'ALWAYS',
      childRank: null,
      cycleId: null,
      levelId: null,
      classGroupId: null,
      campusId: null,
    };
  }

  setTab(tab: 'REQUESTS' | 'RULES') {
    this.activeTab = tab;
    this.error.set('');
    this.success.set('');
  }

  onYearChange() {
    this.page.set(0);
    this.loadEnrollments();
    this.loadRules();
  }

  loadEnrollments() {
    if (!this.schoolYearId) {
      this.enrollments.set([]);
      return;
    }
    forkJoin({
      enrollments: this.refs.enrollments(this.schoolYearId, 0, 200),
      registrations: this.refs.registrations('', this.schoolYearId, null, 0, 200),
    }).subscribe({
      next: (r) => {
        this.enrollments.set(r.enrollments.content);
        // On conserve aussi les dossiers de préinscription qui n'ont pas encore de scolarisation.
        this.registrations.set(r.registrations.content);
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  loadRequests() {
    this.loading.set(true);
    this.discounts.search(this.filterStatus || null, null, this.page(), this.size).subscribe({
      next: (r) => {
        this.items.set(r.content);
        this.pages.set(r.totalPages);
        this.total.set(r.totalElements);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(this.msg(e));
        this.loading.set(false);
      },
    });
  }

  loadRules() {
    if (!this.schoolYearId) {
      this.rules.set([]);
      return;
    }
    this.rulesService.list(this.schoolYearId).subscribe({
      next: (r) => this.rules.set(r),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  openCreate() {
    this.form = this.emptyDiscountForm();
    this.selectedTarget = this.filteredTargets()[0]?.key ?? '';
    this.syncSelectedTarget();
    this.modal.set(true);
  }

  saveDiscount() {
    this.syncSelectedTarget();
    if ((!this.form.studentEnrollmentId && !this.form.registrationCaseId) || this.form.value < 0) {
      this.error.set('Élève et valeur de réduction sont obligatoires.');
      return;
    }
    if (this.form.discountType === 'PERCENTAGE' && this.form.value > 100) {
      this.error.set('Le pourcentage ne peut pas dépasser 100 %.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.discounts.create({
      ...this.form,
      reason: this.form.reason?.trim() || null,
      endDate: this.form.endDate || null,
    }).subscribe({
      next: (x) => {
        this.saving.set(false);
        this.modal.set(false);
        this.success.set(
          x.status === 'APPROVED'
            ? 'Réduction créée, validée et appliquée immédiatement.'
            : 'Demande de réduction créée. Elle attend maintenant la validation de l’administrateur.',
        );
        this.loadRequests();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  approve(x: StudentDiscount) {
    this.error.set('');
    this.discounts.approve(x.id).subscribe({
      next: () => {
        this.success.set('Réduction validée et appliquée aux créances concernées.');
        this.loadRequests();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  openReject(x: StudentDiscount) {
    this.selectedForReject.set(x);
    this.rejectionReason = '';
    this.rejectModal.set(true);
  }

  reject() {
    const x = this.selectedForReject();
    if (!x || !this.rejectionReason.trim()) {
      this.error.set('Le motif de refus est obligatoire.');
      return;
    }
    this.discounts.reject(x.id, { reason: this.rejectionReason.trim() }).subscribe({
      next: () => {
        this.rejectModal.set(false);
        this.selectedForReject.set(null);
        this.success.set('Demande de réduction refusée.');
        this.loadRequests();
      },
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  reapply(x: StudentDiscount) {
    if (x.studentEnrollmentId == null) {
      this.error.set("Le recalcul manuel concerne uniquement les élèves déjà scolarisés. Pour une préinscription, la réduction est appliquée aux frais d'inscription lors de sa validation.");
      return;
    }
    this.discounts.reapplyEnrollment(x.studentEnrollmentId).subscribe({
      next: (r) => this.success.set(
        `Réductions recalculées : ${r.chargesUpdated} créance(s), ${this.money(r.totalReductionApplied)} de réduction, ${this.money(r.familyCreditCreated)} d’avoir créé.`,
      ),
      error: (e) => this.error.set(this.msg(e)),
    });
  }

  openRuleCreate() {
    this.editingRule.set(null);
    this.ruleForm = {
      ...this.emptyRuleForm(),
      schoolYearId: this.schoolYearId ?? this.years()[0]?.id ?? 0,
    };
    this.ruleModal.set(true);
  }

  openRuleEdit(x: DiscountRule) {
    this.editingRule.set(x);
    this.ruleForm = { ...x };
    this.ruleModal.set(true);
  }

  saveRule() {
    if (!this.ruleForm.schoolYearId || !this.ruleForm.code.trim() || !this.ruleForm.name.trim()) {
      this.error.set('Année, code et nom de la règle sont obligatoires.');
      return;
    }
    if (this.ruleForm.conditionType === 'FAMILY_CHILD_RANK' && (!this.ruleForm.childRank || this.ruleForm.childRank < 1)) {
      this.error.set('Indiquez le rang de l’enfant pour la règle familiale.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const request: DiscountRuleRequest = {
      ...this.ruleForm,
      code: this.ruleForm.code.trim().toUpperCase(),
      name: this.ruleForm.name.trim(),
      validFrom: this.ruleForm.validFrom || null,
      validUntil: this.ruleForm.validUntil || null,
      childRank: this.ruleForm.conditionType === 'FAMILY_CHILD_RANK' ? this.ruleForm.childRank : null,
    };
    const op = this.editingRule()
      ? this.rulesService.update(this.editingRule()!.id, request)
      : this.rulesService.create(request);
    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.ruleModal.set(false);
        this.success.set(this.editingRule() ? 'Règle mise à jour.' : 'Règle de réduction créée.');
        this.loadRules();
      },
      error: (e) => {
        this.saving.set(false);
        this.error.set(this.msg(e));
      },
    });
  }

  applyRule(x: DiscountRule) {
    this.applyingRuleId.set(x.id);
    this.error.set('');
    this.rulesService.apply(x.id).subscribe({
      next: (r) => {
        this.applyingRuleId.set(null);
        this.success.set(
          `Règle appliquée : ${r.chargesUpdated} créance(s) recalculée(s), ${this.money(r.totalReductionApplied)} de réduction, ${this.money(r.familyCreditCreated)} d’avoir créé.`,
        );
        this.loadRequests();
      },
      error: (e) => {
        this.applyingRuleId.set(null);
        this.error.set(this.msg(e));
      },
    });
  }

  onRuleCycleChange() {
    if (this.ruleForm.levelId) {
      const l = this.levels().find((x) => x.id === this.ruleForm.levelId);
      if (this.ruleForm.cycleId && l?.cycleId !== this.ruleForm.cycleId) {
        this.ruleForm.levelId = null;
        this.ruleForm.classGroupId = null;
      }
    }
  }

  onRuleLevelChange() {
    if (this.ruleForm.levelId) {
      const l = this.levels().find((x) => x.id === this.ruleForm.levelId);
      if (l) this.ruleForm.cycleId = l.cycleId;
    }
    if (this.ruleForm.classGroupId) {
      const c = this.classes().find((x) => x.id === this.ruleForm.classGroupId);
      if (c?.levelId !== this.ruleForm.levelId) this.ruleForm.classGroupId = null;
    }
  }

  filteredRuleLevels() {
    return this.ruleForm.cycleId
      ? this.levels().filter((x) => x.cycleId === this.ruleForm.cycleId)
      : this.levels();
  }

  filteredRuleClasses() {
    return this.classes().filter((c) => {
      if (c.schoolYearId !== this.ruleForm.schoolYearId) return false;
      if (this.ruleForm.levelId && c.levelId !== this.ruleForm.levelId) return false;
      if (this.ruleForm.campusId && c.campusId !== this.ruleForm.campusId) return false;
      if (this.ruleForm.cycleId) {
        const l = this.levels().find((x) => x.id === c.levelId);
        if (l?.cycleId !== this.ruleForm.cycleId) return false;
      }
      return true;
    });
  }

  filteredTargets() {
    const enrolledStudentIds = new Set(this.enrollments().map(e => e.studentId));
    const enrollmentTargets = this.enrollments().map(e => ({
      key: `E:${e.id}`, type: 'ENROLLMENT' as const, id: e.id,
      name: `${e.studentLastName ?? ''} ${e.studentFirstName ?? ''}`.trim(),
      number: e.studentNumber ?? '', meta: e.classGroupName ?? 'Scolarisé',
    }));
    const registrationTargets = this.registrations()
      .filter(r => !enrolledStudentIds.has(r.studentId))
      .map(r => ({
        key: `R:${r.id}`, type: 'REGISTRATION' as const, id: r.id,
        name: `${r.studentLastName ?? ''} ${r.studentFirstName ?? ''}`.trim(),
        number: r.studentNumber ?? '', meta: `Préinscription · ${r.status}`,
      }));
    const all = [...registrationTargets, ...enrollmentTargets];
    const q = this.enrollmentSearch.trim().toLowerCase();
    return q ? all.filter(x => `${x.name} ${x.number} ${x.meta}`.toLowerCase().includes(q)) : all;
  }

  syncSelectedTarget() {
    this.form.studentEnrollmentId = null;
    this.form.registrationCaseId = null;
    if (!this.selectedTarget) return;
    const [type, rawId] = this.selectedTarget.split(':');
    const id = Number(rawId);
    if (type === 'E') this.form.studentEnrollmentId = id;
    if (type === 'R') this.form.registrationCaseId = id;
  }


  discountStudentName(x: StudentDiscount) {
    if (x.studentEnrollmentId != null) return this.enrollmentName(x.studentEnrollmentId);
    if (x.registrationCaseId != null) {
      const r = this.registrations().find(v => v.id === x.registrationCaseId);
      if (!r) return `Préinscription #${x.registrationCaseId}`;
      return `${r.studentLastName ?? ''} ${r.studentFirstName ?? ''}`.trim() || r.studentNumber || `Préinscription #${x.registrationCaseId}`;
    }
    return 'Élève non renseigné';
  }

  discountStudentMeta(x: StudentDiscount) {
    if (x.studentEnrollmentId != null) return this.enrollmentMeta(x.studentEnrollmentId);
    if (x.registrationCaseId != null) {
      const r = this.registrations().find(v => v.id === x.registrationCaseId);
      if (!r) return `Préinscription #${x.registrationCaseId}`;
      return [r.studentNumber, 'Préinscription', r.status].filter(Boolean).join(' · ');
    }
    return '—';
  }

  enrollmentName(id: number) {
    const e = this.enrollments().find((x) => x.id === id);
    if (!e) return `Scolarisation #${id}`;
    return `${e.studentLastName ?? ''} ${e.studentFirstName ?? ''}`.trim() || e.studentNumber || `Scolarisation #${id}`;
  }

  enrollmentMeta(id: number) {
    const e = this.enrollments().find((x) => x.id === id);
    if (!e) return `#${id}`;
    return [e.studentNumber, e.classGroupName].filter(Boolean).join(' · ');
  }

  feeName(id: number | null) {
    if (!id) return 'Tous les frais';
    return this.feeTypes().find((x) => x.id === id)?.name ?? `Frais #${id}`;
  }

  typeLabel(type: string) {
    return ({
      PERCENTAGE: 'Pourcentage',
      FIXED_AMOUNT: 'Montant fixe',
      NEW_AMOUNT: 'Nouveau montant',
    } as Record<string, string>)[type] ?? type;
  }

  valueLabel(type: string, value: number) {
    return type === 'PERCENTAGE' ? `${value}%` : this.money(value);
  }

  statusLabel(status: string) {
    return ({
      PENDING_APPROVAL: 'En attente',
      APPROVED: 'Validée',
      REJECTED: 'Refusée',
      CANCELLED: 'Annulée',
    } as Record<string, string>)[status] ?? status;
  }

  conditionLabel(x: DiscountRule) {
    return x.conditionType === 'FAMILY_CHILD_RANK'
      ? `${x.childRank}${x.childRank === 1 ? 'er' : 'e'} enfant de la famille`
      : 'Toujours';
  }

  ruleScope(x: DiscountRule) {
    const parts: string[] = [this.feeName(x.feeTypeId)];
    if (x.cycleId) parts.push(this.cycles().find((c) => c.id === x.cycleId)?.name ?? `Cycle #${x.cycleId}`);
    if (x.levelId) parts.push(this.levels().find((l) => l.id === x.levelId)?.name ?? `Niveau #${x.levelId}`);
    if (x.classGroupId) parts.push(this.classes().find((c) => c.id === x.classGroupId)?.name ?? `Classe #${x.classGroupId}`);
    if (x.campusId) parts.push(this.campuses().find((c) => c.id === x.campusId)?.name ?? `Campus #${x.campusId}`);
    return parts.join(' · ');
  }

  discountValueHint(type: DiscountType) {
    if (type === 'PERCENTAGE') return 'Ex. 50 pour une remise de 50 %';
    if (type === 'FIXED_AMOUNT') return 'Montant à déduire du tarif normal';
    return 'Montant final que l’élève devra payer';
  }

  prev() {
    if (this.page() > 0) {
      this.page.update((x) => x - 1);
      this.loadRequests();
    }
  }

  next() {
    if (this.page() + 1 < this.pages()) {
      this.page.update((x) => x + 1);
      this.loadRequests();
    }
  }

  money(v: number) {
    return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0))} DA`;
  }

  msg(e: any) {
    return e?.error?.message ?? 'Une erreur est survenue.';
  }
}
