export interface StudentGuardian {
  id: number;

  studentId: number;

  guardianId: number;

  /*
   * Identité du responsable renvoyée directement
   * par le backend.
   */
  guardianLastName: string;

  guardianFirstName: string;

  guardianPhone: string | null;

  guardianEmail: string | null;

  relationshipType: string;

  legalGuardian: boolean;

  financialResponsible: boolean;

  primaryContact: boolean;

  livesWithStudent: boolean | null;

  pickupAuthorized: boolean;

  active: boolean;

  validFrom: string | null;

  validUntil: string | null;
}

export interface StudentGuardianRequest {
  guardianId: number;

  relationshipType: string;

  legalGuardian: boolean;

  financialResponsible: boolean;

  primaryContact: boolean;

  livesWithStudent: boolean | null;

  pickupAuthorized: boolean;

  active: boolean;

  validFrom: string | null;

  validUntil: string | null;
}
