export interface SchoolYearRef {
  id: number;
  code: string;
  label: string;
  startDate: string;
  endDate: string;
  status: string;
  currentYear: boolean;
}
export interface LevelRef {
  id: number;
  cycleId: number;
  cycleName?: string;
  code: string;
  name: string;
  displayOrder: number;
  active: boolean;
}
export interface ClassGroupRef {
  id: number;
  schoolYearId: number;
  levelId: number;
  campusId: number;
  code: string;
  name: string;
  capacity?: number | null;
  status: string;
}
export interface CampusRef {
  id: number;
  code: string;
  name: string;
  address?: string | null;
  active: boolean;
}
export interface PersonRef {
  id: number;
  lastName: string;
  firstName: string;
  phone: string | null;
  email: string | null;
}
export interface GuardianChoice {
  id: number;
  personId: number;
  status: string;
  person: PersonRef | null;
}
export interface RegistrationChoice {
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
  status: string;
}
export interface EnrollmentChoice {
  id: number;
  studentId: number;
  studentNumber: string;
  schoolYearId: number;
  currentClassGroupId: number;
  enrollmentDate: string;
  entryType: string;
  status: string;
}
