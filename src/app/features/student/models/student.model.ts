import {
  Person,
  PersonCreateRequest
} from './person.model';


export interface Student {

  id: number;

  personId: number;

  studentNumber: string;

  initialAdmissionDate: string | null;

  status: string;

  createdAt: string;
  updatedAt: string;
}


/*
 * Objet utilisé uniquement dans
 * l'affichage Angular.
 *
 * Il ne correspond pas directement
 * à un DTO backend.
 */
export interface StudentView extends Student {

  person: Person | null;
}


/*
 * Ancienne création avec personId.
 *
 * On peut la conserver car l'endpoint
 * backend existe toujours.
 */
export interface StudentCreateRequest {

  personId: number;

  studentNumber: string;

  initialAdmissionDate: string | null;

  status: string;
}


export interface StudentUpdateRequest {


  initialAdmissionDate: string | null;

  status: string;
}


/*
 * Nouvelle création complète :
 *
 * Person + Student
 */
export interface StudentWithPersonCreateRequest {

  person: PersonCreateRequest;

  initialAdmissionDate: string | null;

  status: string;
}


export interface StudentWithPersonResponse {

  student: Student;

  person: Person;
}