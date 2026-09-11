import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../../../core/config/auth/services/auth.service';

import { Guardian } from '../../../student/models/guardian.model';
import {
  StudentGuardian,
  StudentGuardianRequest,
} from '../../../student/models/student-guardian.model';

import { StudentFamilyInfoRequest } from '../../../student/models/student-family-info.model';

import { StudentMedicalInfoRequest } from '../../../student/models/student-medical-info.model';

import {
  AuthorizedPickupPerson,
  AuthorizedPickupPersonRequest,
} from '../../../student/models/authorized-pickup-person.model';

import { GuardianService } from '../../../student/services/guardian.service';
import { StudentGuardianService } from '../../../student/services/student-guardian.service';
import { StudentFamilyInfoService } from '../../../student/services/student-family-info.service';
import { StudentMedicalInfoService } from '../../../student/services/student-medical-info.service';
import { AuthorizedPickupPersonService } from '../../../student/services/authorized-pickup-person.service';

import { ClassGroupRef } from '../../models/reference.model';

import {
  EnrollmentEntryType,
  RegistrationCaseDetail,
  RegistrationConsentRequest,
  RegistrationInfoRequest,
} from '../../models/registration.model';

import { RegistrationCaseService } from '../../services/registration-case.service';
import { RegistrationConsentService } from '../../services/registration-consent.service';
import { RegistrationDocumentService } from '../../services/registration-document.service';
import { RegistrationInfoService } from '../../services/registration-info.service';
import { RegistrationReferenceService } from '../../services/registration-reference.service';
import { PersonService } from '../../../student/services/person.service';

type Tab =
  | 'overview'
  | 'info'
  | 'guardians'
  | 'family'
  | 'medical'
  | 'pickups'
  | 'documents'
  | 'consents'
  | 'enrollment';

@Component({
  selector: 'app-registration-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration-detail.component.html',
  styleUrl: './registration-detail.component.scss',
})
export class RegistrationDetailComponent {
  private route = inject(ActivatedRoute);

  private cases = inject(RegistrationCaseService);
  private infos = inject(RegistrationInfoService);
  private docs = inject(RegistrationDocumentService);
  private consentsSvc = inject(RegistrationConsentService);
  private refs = inject(RegistrationReferenceService);
  private personService = inject(PersonService);

  /*
   * Services du module Student.
   * On réutilise les données existantes :
   * aucune duplication dans RegistrationCase.
   */
  private guardianService = inject(GuardianService);
  private studentGuardianService = inject(StudentGuardianService);
  private familyService = inject(StudentFamilyInfoService);
  private medicalService = inject(StudentMedicalInfoService);
  private pickupService = inject(AuthorizedPickupPersonService);

  auth = inject(AuthService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  detail = signal<RegistrationCaseDetail | null>(null);

  classes = signal<ClassGroupRef[]>([]);

  tab = signal<Tab>('overview');

  error = signal('');
  success = signal('');
  busy = signal(false);

  cancelModal = signal(false);
  cancelReason = '';

  /*
   * RESPONSABLES
   */
  guardians = signal<Guardian[]>([]);
  links = signal<StudentGuardian[]>([]);

  guardianModal = signal(false);

  guardianSearch = '';

  guardianPage = signal(0);
  guardianPageSize = signal(20);
  guardianTotalElements = signal(0);
  guardianTotalPages = signal(0);

  linkForm: StudentGuardianRequest = {
    guardianId: 0,
    relationshipType: 'PARENT',
    legalGuardian: true,
    financialResponsible: false,
    primaryContact: false,
    livesWithStudent: null,
    pickupAuthorized: true,
    active: true,
    validFrom: null,
    validUntil: null,
  };

  /*
   * INFORMATIONS FAMILIALES
   */
  family: StudentFamilyInfoRequest = {
    fatherLifeStatus: null,
    motherLifeStatus: null,
    parentsDivorced: null,
    numberOfBrothers: null,
    numberOfSisters: null,
    notes: null,
  };

  familyLoaded = signal(false);

  /*
   * INFORMATIONS MÉDICALES
   */
  medical: StudentMedicalInfoRequest = {
    bloodGroup: null,
    medicalConditions: null,
    allergies: null,
    treatments: null,
    emergencyNotes: null,
  };

  medicalLoaded = signal(false);

  /*
   * PERSONNES AUTORISÉES
   */
  pickups = signal<AuthorizedPickupPerson[]>([]);

  pickupModal = signal(false);

  pickup: AuthorizedPickupPersonRequest = this.emptyPickup();

  /*
   * INFORMATIONS PROPRES AU DOSSIER
   */
  info: RegistrationInfoRequest = {
    previousSchool: null,
    previousClass: null,
    notes: null,
  };

  /*
   * CONSENTEMENT
   */
  consent: RegistrationConsentRequest = {
    consentType: 'AUTORISATION_TRAITEMENT_DONNEES',
    accepted: false,
    acceptedByGuardianId: null,
    notes: null,
  };

  /*
   * SCOLARISATION
   */
  finalClassId: number | null = null;

  enrollmentDate = new Date().toISOString().slice(0, 10);

  entryType: EnrollmentEntryType = 'NOUVELLE_INSCRIPTION';

  constructor() {
    this.refs.classGroups().subscribe({
      next: (value) => {
        this.classes.set(value);
      },
      error: (err) => {
        console.error('Erreur chargement classes', err);
      },
    });

    this.load();
  }

  /*
   * =========================================================
   * DOSSIER
   * =========================================================
   */

  load(): void {
    if (!this.id) {
      this.error.set('Identifiant du dossier invalide.');
      return;
    }

    this.error.set('');

    this.cases.getById(this.id).subscribe({
      next: (d) => {
        this.detail.set(d);

        this.info = {
          previousSchool: d.registrationInfo?.previousSchool ?? null,

          previousClass: d.registrationInfo?.previousClass ?? null,

          notes: d.registrationInfo?.notes ?? null,
        };

        this.consent.acceptedByGuardianId = d.registration.guardianId;

        this.finalClassId =
          d.enrollment?.currentClassGroupId ??
          d.registration.requestedClassGroupId ??
          null;
      },

      error: (e) => {
        console.error('Erreur chargement dossier', e);

        this.error.set(
          e?.error?.message ?? 'Impossible de charger le dossier.',
        );
      },
    });
  }

  /*
   * =========================================================
   * NAVIGATION DES ONGLETS
   * =========================================================
   */

  setTab(tab: Tab): void {
    this.tab.set(tab);

    switch (tab) {
      case 'guardians':
        this.loadGuardians();
        break;

      case 'family':
        this.loadFamily();
        break;

      case 'medical':
        this.loadMedical();
        break;

      case 'pickups':
        this.loadPickups();
        break;
    }
  }

  /*
   * =========================================================
   * ACTION GÉNÉRIQUE
   * =========================================================
   */

  action(call: any, message: string): void {
    this.busy.set(true);
    this.error.set('');
    this.success.set('');

    call.subscribe({
      next: () => {
        this.busy.set(false);
        this.success.set(message);

        this.load();
      },

      error: (e: any) => {
        this.busy.set(false);

        console.error('Erreur action inscription', e);

        this.error.set(e?.error?.message ?? 'Action impossible.');
      },
    });
  }

  /*
   * =========================================================
   * WORKFLOW
   * =========================================================
   */

  submit(): void {
    this.action(
      this.cases.submitPayment(this.id),
      'Dossier envoyé en attente de paiement.',
    );
  }

  paid(): void {
    this.action(this.cases.paymentConfirmed(this.id), 'Paiement confirmé.');
  }

  start(): void {
    this.action(
      this.cases.startCompletion(this.id),
      'Complément du dossier démarré.',
    );
  }

  incomplete(): void {
    this.action(
      this.cases.markIncomplete(this.id),
      'Dossier marqué incomplet.',
    );
  }

  /*
   * =========================================================
   * INFORMATIONS D'INSCRIPTION
   * =========================================================
   */

  saveInfo(): void {
    this.action(
      this.infos.save(this.id, this.info),
      'Informations d’inscription enregistrées.',
    );
  }

  /*
   * =========================================================
   * RESPONSABLES
   * =========================================================
   */

  loadGuardians(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.error.set('');

    /*
     * Les liens de l'élève sont chargés séparément.
     * La recherche des responsables reste paginée.
     */
    forkJoin({
      page: this.guardianService.getPage(
        this.guardianPage(),
        this.guardianPageSize(),
        this.guardianSearch,
      ),

      links: this.studentGuardianService.getByStudent(studentId),
    }).subscribe({
      next: (data) => {
        this.guardianTotalElements.set(data.page.totalElements);

        this.guardianTotalPages.set(data.page.totalPages);

        this.links.set(data.links);

        const pageGuardians = data.page.content;

        if (!pageGuardians.length) {
          this.guardians.set([]);

          return;
        }

        forkJoin(
          pageGuardians.map((guardian) =>
            this.personService
              .getById(guardian.personId)
              .pipe(catchError(() => of(null))),
          ),
        ).subscribe((persons) => {
          const enriched = pageGuardians.map((guardian, index) => ({
            ...guardian,
            person: persons[index],
          }));

          this.guardians.set(enriched);
        });
      },

      error: (e) => {
        console.error('Erreur chargement responsables', e);

        this.error.set(
          e?.error?.message ?? 'Impossible de charger les responsables.',
        );
      },
    });
  }

  searchGuardians(): void {
    this.guardianPage.set(0);
    this.loadGuardians();
  }

  previousGuardianPage(): void {
    if (this.guardianPage() <= 0) {
      return;
    }

    this.guardianPage.update((value) => value - 1);

    this.loadGuardians();
  }

  nextGuardianPage(): void {
    if (this.guardianPage() + 1 >= this.guardianTotalPages()) {
      return;
    }

    this.guardianPage.update((value) => value + 1);

    this.loadGuardians();
  }

  isGuardianLinked(guardianId: number): boolean {
    return this.links().some((link) => link.guardianId === guardianId);
  }

  selectGuardian(guardian: Guardian): void {
    if (this.isGuardianLinked(guardian.id)) {
      return;
    }

    this.linkForm = {
      guardianId: guardian.id,
      relationshipType: 'PARENT',
      legalGuardian: true,
      financialResponsible: false,
      primaryContact: false,
      livesWithStudent: null,
      pickupAuthorized: true,
      active: true,
      validFrom: null,
      validUntil: null,
    };

    this.guardianModal.set(true);
  }

  saveGuardianLink(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    if (!this.linkForm.guardianId) {
      this.error.set('Sélectionne un responsable.');

      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.studentGuardianService.create(studentId, this.linkForm).subscribe({
      next: () => {
        this.busy.set(false);
        this.guardianModal.set(false);

        this.success.set('Responsable lié à l’élève.');

        this.loadGuardians();
        this.refreshValidation();
      },

      error: (e) => {
        this.busy.set(false);

        console.error('Erreur liaison responsable', e);

        this.error.set(e?.error?.message ?? 'Impossible de créer le lien.');
      },
    });
  }

  /*
   * =========================================================
   * INFORMATIONS FAMILIALES
   * =========================================================
   */

  loadFamily(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.familyService
      .get(studentId)
      .pipe(
        catchError((error) => {
          if (error?.status === 404) {
            return of(null);
          }

          throw error;
        }),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.family = {
              fatherLifeStatus: data.fatherLifeStatus,

              motherLifeStatus: data.motherLifeStatus,

              parentsDivorced: data.parentsDivorced,

              numberOfBrothers: data.numberOfBrothers,

              numberOfSisters: data.numberOfSisters,

              notes: data.notes,
            };
          }

          this.familyLoaded.set(true);
        },

        error: (e) => {
          console.error('Erreur informations familiales', e);

          this.error.set(
            e?.error?.message ??
              'Impossible de charger les informations familiales.',
          );
        },
      });
  }

  saveFamily(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.familyService.save(studentId, this.family).subscribe({
      next: () => {
        this.busy.set(false);

        this.success.set('Informations familiales enregistrées.');

        this.familyLoaded.set(true);

        this.refreshValidation();
      },

      error: (e) => {
        this.busy.set(false);

        this.error.set(
          e?.error?.message ??
            'Impossible d’enregistrer les informations familiales.',
        );
      },
    });
  }

  /*
   * =========================================================
   * INFORMATIONS MÉDICALES
   * =========================================================
   */

  loadMedical(): void {
    if (!this.auth.hasPermission('INFO_MEDICALE_ELEVE_CONSULTER')) {
      return;
    }

    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.medicalService
      .get(studentId)
      .pipe(
        catchError((error) => {
          if (error?.status === 404) {
            return of(null);
          }

          throw error;
        }),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.medical = {
              bloodGroup: data.bloodGroup,

              medicalConditions: data.medicalConditions,

              allergies: data.allergies,

              treatments: data.treatments,

              emergencyNotes: data.emergencyNotes,
            };
          }

          this.medicalLoaded.set(true);
        },

        error: (e) => {
          console.error('Erreur informations médicales', e);

          this.error.set(
            e?.error?.message ??
              'Impossible de charger les informations médicales.',
          );
        },
      });
  }

  saveMedical(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.medicalService.save(studentId, this.medical).subscribe({
      next: () => {
        this.busy.set(false);

        this.success.set('Informations médicales enregistrées.');

        this.medicalLoaded.set(true);

        this.refreshValidation();
      },

      error: (e) => {
        this.busy.set(false);

        this.error.set(
          e?.error?.message ??
            'Impossible d’enregistrer les informations médicales.',
        );
      },
    });
  }

  /*
   * =========================================================
   * PERSONNES AUTORISÉES
   * =========================================================
   */

  loadPickups(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    this.pickupService.getByStudent(studentId).subscribe({
      next: (data) => {
        this.pickups.set(data);
      },

      error: (e) => {
        console.error('Erreur personnes autorisées', e);

        this.error.set(
          e?.error?.message ??
            'Impossible de charger les personnes autorisées.',
        );
      },
    });
  }

  openPickup(): void {
    this.pickup = this.emptyPickup();

    this.pickupModal.set(true);
  }

  savePickup(): void {
    const studentId = this.detail()?.registration.studentId;

    if (!studentId) {
      return;
    }

    if (
      !this.pickup.firstName.trim() ||
      !this.pickup.lastName.trim() ||
      !this.pickup.phone.trim()
    ) {
      this.error.set('Nom, prénom et téléphone sont obligatoires.');

      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.pickupService.create(studentId, this.pickup).subscribe({
      next: () => {
        this.busy.set(false);
        this.pickupModal.set(false);

        this.success.set('Personne autorisée ajoutée.');

        this.loadPickups();
        this.refreshValidation();
      },

      error: (e) => {
        this.busy.set(false);

        this.error.set(
          e?.error?.message ?? 'Impossible d’ajouter la personne autorisée.',
        );
      },
    });
  }

  private emptyPickup(): AuthorizedPickupPersonRequest {
    return {
      firstName: '',
      lastName: '',
      relationship: null,
      phone: '',
      identityDocumentNumber: null,
      issuedBy: null,
      validFrom: null,
      validUntil: null,
      active: true,
    };
  }

  /*
   * =========================================================
   * PIÈCES
   * =========================================================
   */

  saveDocument(document: any): void {
    this.action(
      this.docs.save(this.id, {
        requirementId: document.requirementId,

        provided: document.provided,

        verified: document.verified,

        notes: document.notes,
      }),
      'Pièce mise à jour.',
    );
  }

  /*
   * =========================================================
   * CONSENTEMENTS
   * =========================================================
   */

  saveConsent(): void {
    this.action(
      this.consentsSvc.save(this.id, this.consent),
      'Consentement enregistré.',
    );
  }

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  validate(): void {
    this.refreshValidation();
  }

  private refreshValidation(): void {
    this.cases.validation(this.id).subscribe({
      next: (validation) => {
        const current = this.detail();

        if (!current) {
          return;
        }

        this.detail.set({
          ...current,
          validation,
        });
      },

      error: (e) => {
        console.error('Erreur validation dossier', e);

        this.error.set(
          e?.error?.message ?? 'Impossible de contrôler le dossier.',
        );
      },
    });
  }

  /*
   * =========================================================
   * FINALISATION
   * =========================================================
   */

  finalize(): void {
    if (!this.finalClassId) {
      this.error.set('Sélectionne la classe finale.');

      return;
    }

    const validation = this.detail()?.validation;

    if (!validation?.valid) {
      this.error.set(
        'Le dossier est incomplet. Complète les éléments obligatoires avant la finalisation.',
      );

      return;
    }

    this.action(
      this.cases.finalize(this.id, {
        classGroupId: this.finalClassId,

        enrollmentDate: this.enrollmentDate || null,

        entryType: this.entryType,
      }),
      'Inscription finalisée et scolarisation créée.',
    );
  }

  /*
   * =========================================================
   * ANNULATION
   * =========================================================
   */

  cancel(): void {
    if (!this.cancelReason.trim()) {
      return;
    }

    this.action(
      this.cases.cancel(this.id, this.cancelReason.trim()),
      'Dossier annulé.',
    );

    this.cancelModal.set(false);
  }

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  label(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }

    return value.replaceAll('_', ' ');
  }
}
