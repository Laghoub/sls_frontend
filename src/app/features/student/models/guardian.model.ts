import { Person, PersonCreateRequest } from './person.model';

/*
 * =========================================================
 * RESPONSABLE
 * =========================================================
 */

export interface Guardian {
  id: number;

  personId: number;

  status: string;

  createdAt: string;

  /*
   * Propriété facultative utilisée par les écrans
   * qui enrichissent Guardian avec les données Person.
   *
   * Ce n'est pas une nouvelle colonne en base.
   */
  person?: Person | null;
}

/*
 * =========================================================
 * CRÉATION AVEC PERSON EXISTANTE
 * =========================================================
 */

export interface GuardianCreateRequest {
  personId: number;

  status: string;
}

/*
 * =========================================================
 * MODIFICATION
 * =========================================================
 */

export interface GuardianUpdateRequest {
  status: string;
}

/*
 * =========================================================
 * CRÉATION ATOMIQUE PERSON + GUARDIAN
 * =========================================================
 */

export interface GuardianWithPersonCreateRequest {
  person: PersonCreateRequest;

  status: string;
}

/*
 * =========================================================
 * RÉPONSE CRÉATION PERSON + GUARDIAN
 * =========================================================
 *
 * Ce type était déjà utilisé par GuardianService.
 * Il ne faut donc surtout pas le supprimer.
 * =========================================================
 */

export interface GuardianWithPersonResponse {
  guardian: Guardian;

  person: Person;
}

/*
 * =========================================================
 * VUE FRONTEND ENRICHIE
 * =========================================================
 */

export interface GuardianView extends Guardian {
  person: Person | null;
}
