import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import {
  AuthService
} from '../../../../core/config/auth/services/auth.service';

import {
  StudentView
} from '../../models/student.model';

import {
  StudentService
} from '../../services/student.service';

import {
  PersonService
} from '../../services/person.service';


@Component({
  selector: 'app-student-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent {

  // =========================================================
  // SERVICES
  // =========================================================

  private readonly studentService =
    inject(StudentService);

  private readonly personService =
    inject(PersonService);

  readonly auth =
    inject(AuthService);


  // =========================================================
  // LISTE DES ÉLÈVES
  // =========================================================

  readonly students =
    signal<StudentView[]>([]);


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
  // ÉTAT DE LA PAGE
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
    signal<StudentView | null>(null);


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
  // CHARGEMENT PAGINÉ DES ÉLÈVES
  // =========================================================

  load(): void {

    this.loading.set(true);
    this.error.set('');


    this.studentService
      .getPage(
        this.page(),
        this.pageSize(),
        this.searchTerm
      )
      .subscribe({

        next: response => {

          // ---------------------------------------------------
          // INFORMATIONS PAGINATION
          // ---------------------------------------------------

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


          // ---------------------------------------------------
          // LISTE DE LA PAGE COURANTE
          // ---------------------------------------------------

          const students =
            response.content ?? [];


          if (students.length === 0) {

            this.students.set([]);

            this.loading.set(false);

            return;
          }


          // ---------------------------------------------------
          // RÉCUPÉRATION DES PERSON ASSOCIÉES
          // ---------------------------------------------------
          //
          // Student contient actuellement personId.
          //
          // On récupère donc les informations Person
          // uniquement pour les élèves présents
          // dans la page courante.
          //
          // Exemple :
          //
          // pageSize = 20
          //
          // => maximum 20 requêtes Person
          //
          // et non plus plusieurs centaines.
          // ---------------------------------------------------

          const personRequests =
            students.map(student =>

              this.personService
                .getById(
                  student.personId
                )
                .pipe(

                  /*
                   * Si une identité pose problème,
                   * on ne bloque pas toute la page.
                   */
                  catchError(
                    () => of(null)
                  )

                )
            );


          forkJoin(personRequests)
            .subscribe({

              next: persons => {

                const result:
                  StudentView[] =
                  students.map(
                    (
                      student,
                      index
                    ) => ({

                      ...student,

                      person:
                        persons[index]
                        ?? null

                    })
                  );


                this.students.set(
                  result
                );

                this.loading.set(false);
              },


              error: () => {

                /*
                 * Sécurité supplémentaire.
                 *
                 * Même si l'enrichissement Person
                 * pose problème, on garde la liste.
                 */

                const result:
                  StudentView[] =
                  students.map(
                    student => ({

                      ...student,

                      person: null

                    })
                  );


                this.students.set(
                  result
                );

                this.loading.set(false);
              }

            });
        },


        error: error => {

          this.loading.set(false);

          this.students.set([]);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Impossible de charger les élèves.'
            )
          );
        }

      });
  }


  // =========================================================
  // RECHERCHE SERVEUR
  // =========================================================

  onSearch(): void {

    /*
     * À chaque nouvelle recherche,
     * on revient automatiquement
     * à la première page.
     */

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
      current =>
        current - 1
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
      current =>
        current + 1
    );


    this.load();
  }


  // =========================================================
  // CHANGEMENT DU NOMBRE DE LIGNES
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


    /*
     * Retour première page
     * lorsque la taille change.
     */
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
  // NUMÉROS DE PAGES À AFFICHER
  // =========================================================

  visiblePages(): number[] {

    const total =
      this.totalPages();

    const current =
      this.page();


    if (total <= 1) {

      return [];
    }


    /*
     * On évite d'afficher :
     *
     * 1 2 3 4 5 6 ... 100
     *
     * On affiche seulement
     * quelques pages autour
     * de la page actuelle.
     */

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
  // PREMIER ÉLÉMENT DE LA PAGE
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


  // =========================================================
  // DERNIER ÉLÉMENT DE LA PAGE
  // =========================================================

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
  // OUVERTURE CRÉATION
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
  // OUVERTURE MODIFICATION
  // =========================================================

  openEdit(
    student: StudentView
  ): void {

    this.error.set('');
    this.success.set('');

    this.editing.set(
      student
    );


    /*
     * Le matricule n'est volontairement
     * jamais placé dans le formulaire.
     *
     * Il est généré automatiquement
     * par le backend.
     */

    this.form = {

      lastName:
        student.person?.lastName
        ?? '',

      firstName:
        student.person?.firstName
        ?? '',

      birthDate:
        student.person?.birthDate
        ?? '',

      birthPlace:
        student.person?.birthPlace
        ?? '',

      nationality:
        student.person?.nationality
        ?? '',

      sex:
        student.person?.sex
        ?? '',

      address:
        student.person?.address
        ?? '',

      phone:
        student.person?.phone
        ?? '',

      secondaryPhone:
        student.person?.secondaryPhone
        ?? '',

      email:
        student.person?.email
        ?? '',

      initialAdmissionDate:
        student.initialAdmissionDate
        ?? '',

      status:
        student.status
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


    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

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


    // ---------------------------------------------------------
    // MODIFICATION
    // ---------------------------------------------------------

    if (current) {

      this.updateStudent(
        current
      );

      return;
    }


    // ---------------------------------------------------------
    // CRÉATION
    // ---------------------------------------------------------

    this.createStudent();
  }


  // =========================================================
  // CRÉATION ÉLÈVE + PERSON
  // =========================================================

  private createStudent(): void {

    this.saving.set(true);


    this.studentService
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


        /*
         * Aucun studentNumber.
         *
         * Le backend génère
         * automatiquement le matricule.
         */

        initialAdmissionDate:
          this.form.initialAdmissionDate
          || null,

        status:
          this.form.status

      })
      .subscribe({

        next: response => {

          this.saving.set(false);

          this.modal.set(false);

          this.editing.set(null);


          const generatedNumber =
            response
              ?.student
              ?.studentNumber;


          if (generatedNumber) {

            this.success.set(
              `Élève créé avec succès. Matricule : ${generatedNumber}`
            );

          } else {

            this.success.set(
              'Élève créé avec succès.'
            );
          }


          /*
           * Après création,
           * on revient en page 1
           * pour voir le nouvel élève
           * puisque le backend trie
           * les plus récents en premier.
           */

          this.page.set(0);

          this.load();
        },


        error: error => {

          this.saving.set(false);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Erreur pendant la création de l’élève.'
            )
          );
        }

      });
  }


  // =========================================================
  // MODIFICATION
  // =========================================================

  private updateStudent(
    student: StudentView
  ): void {

    this.saving.set(true);


    this.studentService
      .update(
        student.id,
        {

          /*
           * Le matricule n'est pas envoyé.
           */

          initialAdmissionDate:
            this.form.initialAdmissionDate
            || null,

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
            'Élève modifié avec succès.'
          );


          /*
           * On reste sur la page courante.
           */

          this.load();
        },


        error: error => {

          this.saving.set(false);

          this.error.set(
            this.extractErrorMessage(
              error,
              'Erreur pendant la modification de l’élève.'
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

      // -------------------------------------------------------
      // PERSON
      // -------------------------------------------------------

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


      // -------------------------------------------------------
      // STUDENT
      // -------------------------------------------------------

      /*
       * Aucun studentNumber ici.
       *
       * Le matricule est généré
       * automatiquement par le backend.
       */

      initialAdmissionDate: '',

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
      typeof error
        ?.error
        ?.message === 'string'
      &&
      error
        .error
        .message
        .trim()
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