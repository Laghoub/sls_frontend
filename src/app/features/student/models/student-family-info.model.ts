export interface StudentFamilyInfo {
  id: number;
  studentId: number;
  fatherLifeStatus: string | null;
  motherLifeStatus: string | null;
  parentsDivorced: boolean | null;
  numberOfBrothers: number | null;
  numberOfSisters: number | null;
  notes: string | null;
  updatedAt: string;
}
export type StudentFamilyInfoRequest = Omit<
  StudentFamilyInfo,
  'id' | 'studentId' | 'updatedAt'
>;
