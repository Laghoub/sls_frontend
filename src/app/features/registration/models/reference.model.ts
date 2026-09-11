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
  schoolYearLabel?: string;
  levelId: number;
  levelName?: string;
  campusId: number;
  campusName?: string;
  code: string;
  name: string;
  capacity?: number | null;
  status: string;
}
export interface PersonRef {
  id: number;
  lastName: string;
  firstName: string;
  phone: string | null;
  email: string | null;
}
export interface StudentChoice {
  id: number;
  personId: number;
  studentNumber: string;
  status: string;
  person: PersonRef | null;
}
export interface GuardianChoice {
  id: number;
  personId: number;
  status: string;
  person: PersonRef | null;
}
