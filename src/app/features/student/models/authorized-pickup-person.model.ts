export interface AuthorizedPickupPerson {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string;
  identityDocumentNumber: string | null;
  issuedBy: string | null;
  validFrom: string | null;
  validUntil: string | null;
  active: boolean;
}
export type AuthorizedPickupPersonRequest = Omit<
  AuthorizedPickupPerson,
  'id' | 'studentId'
>;
