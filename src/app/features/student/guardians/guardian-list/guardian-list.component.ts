import { CommonModule } from '@angular/common';

import {
  Component,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import {
  AuthService
} from '../../../../core/config/auth/services/auth.service';

import {
  GuardianView
} from '../../models/guardian.model';

import {
  GuardianService
} from '../../services/guardian.service';

import {
  PersonService
} from '../../services/person.service';


@Component({
  selector: 'app-guardian-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './guardian-list.component.html',

  styleUrl: './guardian-list.component.scss'
})
export class GuardianListComponent {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly guardianService =
    inject(GuardianService);

  private readonly personService =
    inject(PersonService);

  readonly auth =
    inject(AuthService);


  // =========================================================
  // LISTE
  // =========================================================

  readonly guardians =
    signal<GuardianView[]>([]);


  // =========================================================
  // PAGINATION
  // =========================================================

  readonly page =
    signal(0);

  readonly pageSize =
    signal(20);

  readonly totalElements =
    signal(0);

  readonly totalPages =
    signal(0);

  readonly first =
    signal(true);

  readonly last =
    signal(true);


  // =========================================================
  // RECHERCHE
  // =========================================================

  searchTerm = '';


  // =========================================================
  // ÉTAT
  // =========================================================

  readonly loading =
    signal(false);

  readonly saving =
    signal(false);

  readonly error =
    signal('');

  readonly success =
    signal('');

  readonly modal =
    signal(false);

  readonly editing =
    signal<GuardianView | null>(null);


  // =========================================================
  // FORMULAIRE
  // =========================================================

  form = this.emptyForm();


  // =========================================================
  // CONSTRUCTEUR
  // =========================================================

  constructor() {

    this.load();
  }


  // =========================================================
  // CHARGEMENT PAGINÉ
  // =========================================================

  load(): void {

    this.loading.set(true);

    this.error.set('');


    this.guardianService
      .getPage(
        this.page(),
        this.pageSize(),
        this.searchTerm
      )
      .subscribe({

        next: response => {

          this.totalElements.set(
            response.totalElements
          );

          this.totalPages.set(
            response.totalPages
          );

          this.first.set(
            response.first
          );

          this.last.set(
            response.last
          );


          const guardians =
            response.content ?? [];


          if (
            guardians.length === 0
          ) {

            this.guardians.set([]);

            this.loading.set(false);

            return;
          }


          /*
           * On récupère Person uniquement
           * pour les responsables de la page.
           */

          const personRequests =
            guardians.map(
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


          forkJoin(
            personRequests
          )
            .subscribe({

              next: persons => {

                const result:
                  GuardianView[] =
                  guardians.map(
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

                this.loading.set(false);
              },


              error: () => {

                const result:
                  GuardianView[] =
                  guardians.map(
                    guardian => ({

                      ...guardian,

                      person: null

                    })
                  );


                this.guardians.set(
                  result
                );

                this.loading.set(false);
              }

            });
        },


        error: error => {

          this.loading.set(false);

          this.guardians.set([]);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Impossible de charger les responsables.'
            )
          );
        }

      });
  }


  // =========================================================
  // RECHERCHE
  // =========================================================

  onSearch(): void {

    this.page.set(0);

    this.load();
  }


  // =========================================================
  // PAGE PRÉCÉDENTE
  // =========================================================

  previousPage(): void {

    if (
      this.first()
      ||
      this.page() <= 0
    ) {

      return;
    }


    this.page.update(
      value =>
        value - 1
    );


    this.load();
  }


  // =========================================================
  // PAGE SUIVANTE
  // =========================================================

  nextPage(): void {

    if (
      this.last()
    ) {

      return;
    }


    this.page.update(
      value =>
        value + 1
    );


    this.load();
  }


  // =========================================================
  // CHANGEMENT TAILLE PAGE
  // =========================================================

  changePageSize(
    size: number
  ): void {

    const newSize =
      Number(size);


    if (
      !newSize
      ||
      newSize <= 0
    ) {

      return;
    }


    this.pageSize.set(
      newSize
    );

    this.page.set(0);

    this.load();
  }


  // =========================================================
  // ALLER À UNE PAGE
  // =========================================================

  goToPage(
    pageNumber: number
  ): void {

    if (
      pageNumber < 0
      ||
      pageNumber >= this.totalPages()
      ||
      pageNumber === this.page()
    ) {

      return;
    }


    this.page.set(
      pageNumber
    );

    this.load();
  }


  // =========================================================
  // PAGES VISIBLES
  // =========================================================

  visiblePages(): number[] {

    const total =
      this.totalPages();

    const current =
      this.page();


    if (
      total <= 1
    ) {

      return [];
    }


    const start =
      Math.max(
        0,
        current - 2
      );

    const end =
      Math.min(
        total - 1,
        current + 2
      );


    const pages:
      number[] = [];


    for (
      let i = start;
      i <= end;
      i++
    ) {

      pages.push(i);
    }


    return pages;
  }


  // =========================================================
  // NUMÉROTATION
  // =========================================================

  firstItemNumber(): number {

    if (
      this.totalElements() === 0
    ) {

      return 0;
    }


    return (
      this.page()
      *
      this.pageSize()
    ) + 1;
  }


  lastItemNumber(): number {

    if (
      this.totalElements() === 0
    ) {

      return 0;
    }


    return Math.min(

      (
        this.page() + 1
      )
      *
      this.pageSize(),

      this.totalElements()
    );
  }


  // =========================================================
  // NOUVEAU RESPONSABLE
  // =========================================================

  openCreate(): void {

    this.error.set('');

    this.success.set('');

    this.editing.set(null);

    this.form =
      this.emptyForm();

    this.modal.set(true);
  }


  // =========================================================
  // MODIFICATION
  // =========================================================

  openEdit(
    guardian: GuardianView
  ): void {

    this.error.set('');

    this.success.set('');

    this.editing.set(
      guardian
    );


    this.form = {

      lastName:
        guardian.person?.lastName
        ?? '',

      firstName:
        guardian.person?.firstName
        ?? '',

      birthDate:
        guardian.person?.birthDate
        ?? '',

      birthPlace:
        guardian.person?.birthPlace
        ?? '',

      nationality:
        guardian.person?.nationality
        ?? '',

      sex:
        guardian.person?.sex
        ?? '',

      address:
        guardian.person?.address
        ?? '',

      phone:
        guardian.person?.phone
        ?? '',

      secondaryPhone:
        guardian.person?.secondaryPhone
        ?? '',

      email:
        guardian.person?.email
        ?? '',

      status:
        guardian.status
    };


    this.modal.set(true);
  }


  // =========================================================
  // FERMETURE MODALE
  // =========================================================

  closeModal(): void {

    if (
      this.saving()
    ) {

      return;
    }


    this.modal.set(false);

    this.editing.set(null);

    this.error.set('');
  }


  // =========================================================
  // ENREGISTRER
  // =========================================================

  save(): void {

    this.error.set('');

    this.success.set('');


    if (
      !this.form.lastName.trim()
      ||
      !this.form.firstName.trim()
    ) {

      this.error.set(
        'Le nom et le prénom sont obligatoires.'
      );

      return;
    }


    const current =
      this.editing();


    if (current) {

      this.updateGuardian(
        current
      );

      return;
    }


    this.createGuardian();
  }


  // =========================================================
  // CRÉATION
  // =========================================================

  private createGuardian(): void {

    this.saving.set(true);


    this.guardianService
      .createWithPerson({

        person: {

          lastName:
            this.form
              .lastName
              .trim(),

          firstName:
            this.form
              .firstName
              .trim(),

          birthDate:
            this.form.birthDate
            || null,

          birthPlace:
            this.nullIfBlank(
              this.form.birthPlace
            ),

          nationality:
            this.nullIfBlank(
              this.form.nationality
            ),

          sex:
            this.nullIfBlank(
              this.form.sex
            ),

          address:
            this.nullIfBlank(
              this.form.address
            ),

          phone:
            this.nullIfBlank(
              this.form.phone
            ),

          secondaryPhone:
            this.nullIfBlank(
              this.form.secondaryPhone
            ),

          email:
            this.nullIfBlank(
              this.form.email
            ),

          photoReference: null
        },

        status:
          this.form.status

      })
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.modal.set(false);

          this.editing.set(null);

          this.success.set(
            'Responsable créé avec succès.'
          );


          /*
           * Les éléments sont triés
           * du plus récent au plus ancien.
           */

          this.page.set(0);

          this.load();
        },


        error: error => {

          this.saving.set(false);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Erreur pendant la création du responsable.'
            )
          );
        }

      });
  }


  // =========================================================
  // MODIFICATION
  // =========================================================

  private updateGuardian(
    guardian: GuardianView
  ): void {

    this.saving.set(true);


    this.guardianService
      .update(
        guardian.id,
        {
          status:
            this.form.status
        }
      )
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.modal.set(false);

          this.editing.set(null);

          this.success.set(
            'Responsable modifié avec succès.'
          );

          this.load();
        },


        error: error => {

          this.saving.set(false);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Erreur pendant la modification du responsable.'
            )
          );
        }

      });
  }


  // =========================================================
  // FORMULAIRE VIDE
  // =========================================================

  private emptyForm() {

    return {

      lastName: '',

      firstName: '',

      birthDate: '',

      birthPlace: '',

      nationality: '',

      sex: '',

      address: '',

      phone: '',

      secondaryPhone: '',

      email: '',

      status: 'ACTIVE'
    };
  }


  // =========================================================
  // OUTILS
  // =========================================================

  private nullIfBlank(
    value: string | null | undefined
  ): string | null {

    if (
      value == null
    ) {

      return null;
    }


    const normalized =
      value.trim();


    return normalized.length > 0
      ? normalized
      : null;
  }


  private extractErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      typeof error?.error?.message === 'string'
      &&
      error.error.message.trim()
    ) {

      return error.error.message;
    }


    if (
      typeof error?.error === 'string'
      &&
      error.error.trim()
    ) {

      return error.error;
    }


    return fallback;
  }
}