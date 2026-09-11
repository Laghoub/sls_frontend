export type RegistrationStatus =
  | 'PRE_INSCRIPTION'
  | 'EN_ATTENTE_PAIEMENT'
  | 'PAYE_A_COMPLETER'
  | 'EN_COURS'
  | 'INCOMPLET'
  | 'FINALISE'
  | 'ANNULE';
export type EnrollmentStatus = 'ACTIVE' | 'SUSPENDUE' | 'TERMINEE' | 'ANNULEE';
export type EnrollmentEntryType =
  | 'NOUVELLE_INSCRIPTION'
  | 'REINSCRIPTION'
  | 'TRANSFERT';
export interface RegistrationCase {
  id: number;
  schoolYearId: number;
  studentId: number;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  guardianId: number;
  guardianLastName: string;
  guardianFirstName: string;
  requestedLevelId: number;
  requestedClassGroupId: number | null;
  registrationDate: string;
  status: RegistrationStatus;
  createdById: number | null;
  finalizedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface RegistrationCaseCreateRequest {
  schoolYearId: number;
  studentId: number;
  guardianId: number;
  requestedLevelId: number;
  requestedClassGroupId: number | null;
  registrationDate: string | null;
}
export interface RegistrationCaseUpdateRequest {
  guardianId: number;
  requestedLevelId: number;
  requestedClassGroupId: number | null;
}
export interface RegistrationInfo {
  id: number | null;
  registrationCaseId: number;
  previousSchool: string | null;
  previousClass: string | null;
  notes: string | null;
}
export interface RegistrationInfoRequest {
  previousSchool: string | null;
  previousClass: string | null;
  notes: string | null;
}
export interface RegistrationConsent {
  id: number;
  registrationCaseId: number;
  consentType: string;
  accepted: boolean;
  acceptedAt: string | null;
  acceptedByGuardianId: number | null;
  notes: string | null;
}
export interface RegistrationConsentRequest {
  consentType: string;
  accepted: boolean;
  acceptedByGuardianId: number | null;
  notes: string | null;
}
export interface RegistrationDocumentStatus {
  id: number;
  registrationCaseId: number;
  requirementId: number;
  requirementCode: string;
  requirementName: string;
  required: boolean;
  provided: boolean;
  providedAt: string | null;
  verified: boolean;
  verifiedById: number | null;
  verifiedAt: string | null;
  notes: string | null;
}
export interface RegistrationDocumentStatusRequest {
  requirementId: number;
  provided: boolean;
  verified: boolean;
  notes: string | null;
}
export interface RegistrationValidation {
  valid: boolean;
  missingItems: string[];
}
export interface StudentEnrollment {
  id: number;
  studentId: number;
  studentNumber: string;
  schoolYearId: number;
  currentClassGroupId: number;
  enrollmentDate: string;
  entryType: EnrollmentEntryType;
  status: EnrollmentStatus;
  exitDate: string | null;
  exitReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface StudentEnrollmentCreateRequest {
  classGroupId: number;
  enrollmentDate: string | null;
  entryType: EnrollmentEntryType;
}
export interface RegistrationCaseDetail {
  registration: RegistrationCase;
  registrationInfo: RegistrationInfo | null;
  consents: RegistrationConsent[];
  documents: RegistrationDocumentStatus[];
  validation: RegistrationValidation;
  enrollment: StudentEnrollment | null;
}
