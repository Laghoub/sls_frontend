import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import {
  AuthService
} from '../../../../core/config/auth/services/auth.service';

import {
  Student
} from '../../models/student.model';

import {
  GuardianView
} from '../../models/guardian.model';

import {
  StudentGuardian,
  StudentGuardianRequest
} from '../../models/student-guardian.model';

import {
  StudentFamilyInfoRequest
} from '../../models/student-family-info.model';

import {
  StudentMedicalInfoRequest
} from '../../models/student-medical-info.model';

import {
  AuthorizedPickupPerson,
  AuthorizedPickupPersonRequest
} from '../../models/authorized-pickup-person.model';

import {
  StudentService
} from '../../services/student.service';

import {
  GuardianService
} from '../../services/guardian.service';

import {
  PersonService
} from '../../services/person.service';

import {
  StudentGuardianService
} from '../../services/student-guardian.service';

import {
  StudentFamilyInfoService
} from '../../services/student-family-info.service';

import {
  StudentMedicalInfoService
} from '../../services/student-medical-info.service';

import {
  AuthorizedPickupPersonService
} from '../../services/authorized-pickup-person.service';


type Tab =
  | 'overview'
  | 'guardians'
  | 'family'
  | 'pickups'
  | 'medical';


@Component({
  selector: 'app-student-detail',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './student-detail.component.html',

  styleUrl:
    './student-detail.component.scss'
})
export class StudentDetailComponent {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly route =
    inject(ActivatedRoute);

  private readonly ss =
    inject(StudentService);

  private readonly gs =
    inject(GuardianService);

  private readonly personService =
    inject(PersonService);

  private readonly lsvc =
    inject(StudentGuardianService);

  private readonly fsvc =
    inject(StudentFamilyInfoService);

  private readonly msvc =
    inject(StudentMedicalInfoService);

  private readonly psvc =
    inject(AuthorizedPickupPersonService);


  readonly auth =
    inject(AuthService);


  // =========================================================
  // IDENTIFIANT ÉLÈVE
  // =========================================================

  readonly id =
    Number(
      this.route.snapshot.paramMap.get('id')
    );


  // =========================================================
  // ÉTAT PAGE
  // =========================================================

  readonly student =
    signal<Student | null>(null);

  readonly guardians =
    signal<GuardianView[]>([]);

  readonly links =
    signal<StudentGuardian[]>([]);

  readonly pickups =
    signal<AuthorizedPickupPerson[]>([]);

  readonly tab =
    signal<Tab>('overview');

  readonly error =
    signal('');

  readonly success =
    signal('');

  readonly guardianModal =
    signal(false);

  readonly pickupModal =
    signal(false);

  readonly saving =
    signal(false);


  // =========================================================
  // FORMULAIRE LIEN RESPONSABLE
  // =========================================================

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

    validUntil: null
  };


  // =========================================================
  // INFORMATIONS FAMILIALES
  // =========================================================

  family: StudentFamilyInfoRequest = {

    fatherLifeStatus: null,

    motherLifeStatus: null,

    parentsDivorced: null,

    numberOfBrothers: null,

    numberOfSisters: null,

    notes: null
  };


  // =========================================================
  // INFORMATIONS MÉDICALES
  // =========================================================

  medical: StudentMedicalInfoRequest = {

    bloodGroup: null,

    medicalConditions: null,

    allergies: null,

    treatments: null,

    emergencyNotes: null
  };


  // =========================================================
  // PERSONNE AUTORISÉE
  // =========================================================

  pickup: AuthorizedPickupPersonRequest = {

    firstName: '',

    lastName: '',

    relationship: null,

    phone: '',

    identityDocumentNumber: null,

    issuedBy: null,

    validFrom: null,

    validUntil: null,

    active: true
  };


  // =========================================================
  // CONSTRUCTEUR
  // =========================================================

  constructor() {

    this.loadStudent();
  }


  // =========================================================
  // CHARGEMENT ÉLÈVE
  // =========================================================

  private loadStudent(): void {

    this.ss
      .getById(this.id)
      .subscribe({

        next: student => {

          this.student.set(student);
        },

        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Élève introuvable.'
          );
        }

      });
  }


  // =========================================================
  // CHANGEMENT ONGLET
  // =========================================================

  setTab(
    tab: Tab
  ): void {

    this.tab.set(tab);

    this.error.set('');
    this.success.set('');


    if (tab === 'guardians') {
      this.loadGuardians();
    }

    if (tab === 'family') {
      this.loadFamily();
    }

    if (tab === 'pickups') {
      this.loadPickups();
    }

    if (tab === 'medical') {
      this.loadMedical();
    }
  }


  // =========================================================
  // RESPONSABLES
  // =========================================================

  loadGuardians(): void {

    this.error.set('');


    /*
     * On charge :
     *
     * 1. tous les responsables
     * 2. les liens de cet élève
     */
    forkJoin({

      guardians:
        this.gs.getAll(),

      links:
        this.lsvc.getByStudent(
          this.id
        )

    })
      .subscribe({

        next: data => {

          this.links.set(
            data.links
          );


          /*
           * Aucun responsable
           */
          if (
            !data.guardians
            ||
            data.guardians.length === 0
          ) {

            this.guardians.set([]);

            return;
          }


          /*
           * Chaque Guardian possède un personId.
           *
           * On récupère la Person correspondante
           * pour afficher :
           *
           * - nom
           * - prénom
           * - téléphone
           * - email
           */
          const requests =
            data.guardians.map(
              guardian =>
                this.personService
                  .getById(
                    guardian.personId
                  )
                  .pipe(
                    catchError(
                      () => of(null)
                    )
                  )
            );


          forkJoin(requests)
            .subscribe({

              next: persons => {

                const result:
                  GuardianView[] =
                  data.guardians.map(
                    (
                      guardian,
                      index
                    ) => ({

                      ...guardian,

                      person:
                        persons[index]
                        ?? null
                    })
                  );


                this.guardians.set(
                  result
                );
              },


              error: () => {

                /*
                 * Même si l'identité Person
                 * ne charge pas, on ne casse
                 * pas complètement l'écran.
                 */

                this.guardians.set(
                  data.guardians.map(
                    guardian => ({

                      ...guardian,

                      person: null
                    })
                  )
                );
              }

            });
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Erreur de chargement des responsables.'
          );
        }

      });
  }


  // =========================================================
  // RESPONSABLES DISPONIBLES
  // =========================================================

  /*
   * Évite de proposer dans la liste
   * un responsable déjà lié à l'élève.
   */
  availableGuardians(): GuardianView[] {

    const linkedGuardianIds =
      new Set(
        this.links()
          .filter(link => link.active)
          .map(
            link => link.guardianId
          )
      );


    return this.guardians()
      .filter(
        guardian =>
          !linkedGuardianIds.has(
            guardian.id
          )
      );
  }


  // =========================================================
  // TROUVER UN RESPONSABLE
  // =========================================================

  guardianById(
    guardianId: number
  ): GuardianView | null {

    return (
      this.guardians()
        .find(
          guardian =>
            guardian.id === guardianId
        )
      ??
      null
    );
  }


  // =========================================================
  // NOM RESPONSABLE
  // =========================================================

  guardianDisplayName(
    guardianId: number
  ): string {

    const guardian =
      this.guardianById(
        guardianId
      );


    if (!guardian) {

      return `Responsable #${guardianId}`;
    }


    const person =
      guardian.person;


    if (!person) {

      return `Responsable #${guardian.id}`;
    }


    return (
      `${person.lastName} ${person.firstName}`
    );
  }


  // =========================================================
  // OUVRIR MODALE RESPONSABLE
  // =========================================================

  openGuardianModal(): void {

    this.error.set('');
    this.success.set('');


    this.linkForm = {

      guardianId: 0,

      relationshipType: 'PARENT',

      legalGuardian: true,

      financialResponsible: false,

      primaryContact: false,

      livesWithStudent: null,

      pickupAuthorized: true,

      active: true,

      validFrom: null,

      validUntil: null
    };


    this.guardianModal.set(true);
  }


  // =========================================================
  // CRÉER LIEN RESPONSABLE
  // =========================================================

  saveLink(): void {

    this.error.set('');
    this.success.set('');


    if (
      !this.linkForm.guardianId
    ) {

      this.error.set(
        'Veuillez sélectionner un responsable.'
      );

      return;
    }


    if (
      !this.linkForm.relationshipType
        ?.trim()
    ) {

      this.error.set(
        'Veuillez indiquer le lien avec l’élève.'
      );

      return;
    }


    this.saving.set(true);


    this.lsvc
      .create(
        this.id,
        this.linkForm
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.guardianModal.set(
            false
          );

          this.success.set(
            'Responsable lié avec succès.'
          );

          this.loadGuardians();
        },


        error: error => {

          this.saving.set(false);

          this.error.set(
            error?.error?.message
            ??
            'Impossible de créer le lien.'
          );
        }

      });
  }


  // =========================================================
  // FAMILLE
  // =========================================================

  loadFamily(): void {

    this.fsvc
      .get(this.id)
      .pipe(

        catchError(error => {

          if (
            error?.status === 404
          ) {

            return of(null);
          }

          throw error;
        })

      )
      .subscribe({

        next: data => {

          if (!data) {
            return;
          }


          this.family = {

            fatherLifeStatus:
              data.fatherLifeStatus,

            motherLifeStatus:
              data.motherLifeStatus,

            parentsDivorced:
              data.parentsDivorced,

            numberOfBrothers:
              data.numberOfBrothers,

            numberOfSisters:
              data.numberOfSisters,

            notes:
              data.notes
          };
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Impossible de charger les informations familiales.'
          );
        }

      });
  }


  saveFamily(): void {

    this.error.set('');
    this.success.set('');


    this.fsvc
      .save(
        this.id,
        this.family
      )
      .subscribe({

        next: () => {

          this.success.set(
            'Informations familiales enregistrées.'
          );
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Erreur lors de l’enregistrement des informations familiales.'
          );
        }

      });
  }


  // =========================================================
  // PERSONNES AUTORISÉES
  // =========================================================

  loadPickups(): void {

    this.psvc
      .getByStudent(
        this.id
      )
      .subscribe({

        next: data => {

          this.pickups.set(
            data
          );
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Impossible de charger les personnes autorisées.'
          );
        }

      });
  }


  openPickup(): void {

    this.error.set('');
    this.success.set('');


    this.pickup = {

      firstName: '',

      lastName: '',

      relationship: null,

      phone: '',

      identityDocumentNumber: null,

      issuedBy: null,

      validFrom: null,

      validUntil: null,

      active: true
    };


    this.pickupModal.set(
      true
    );
  }


  savePickup(): void {

    this.error.set('');
    this.success.set('');


    if (
      !this.pickup.firstName.trim()
      ||
      !this.pickup.lastName.trim()
      ||
      !this.pickup.phone.trim()
    ) {

      this.error.set(
        'Le prénom, le nom et le téléphone sont obligatoires.'
      );

      return;
    }


    this.psvc
      .create(
        this.id,
        this.pickup
      )
      .subscribe({

        next: () => {

          this.pickupModal.set(
            false
          );

          this.success.set(
            'Personne autorisée ajoutée.'
          );

          this.loadPickups();
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Erreur lors de l’ajout de la personne autorisée.'
          );
        }

      });
  }


  // =========================================================
  // MÉDICAL
  // =========================================================

  loadMedical(): void {

    if (
      !this.auth.hasPermission(
        'INFO_MEDICALE_ELEVE_CONSULTER'
      )
    ) {

      return;
    }


    this.msvc
      .get(this.id)
      .pipe(

        catchError(error => {

          if (
            error?.status === 404
          ) {

            return of(null);
          }

          throw error;
        })

      )
      .subscribe({

        next: data => {

          if (!data) {
            return;
          }


          this.medical = {

            bloodGroup:
              data.bloodGroup,

            medicalConditions:
              data.medicalConditions,

            allergies:
              data.allergies,

            treatments:
              data.treatments,

            emergencyNotes:
              data.emergencyNotes
          };
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Impossible de charger les informations médicales.'
          );
        }

      });
  }


  saveMedical(): void {

    this.error.set('');
    this.success.set('');


    this.msvc
      .save(
        this.id,
        this.medical
      )
      .subscribe({

        next: () => {

          this.success.set(
            'Informations médicales enregistrées.'
          );
        },


        error: error => {

          this.error.set(
            error?.error?.message
            ??
            'Erreur lors de l’enregistrement des informations médicales.'
          );
        }

      });
  }
}