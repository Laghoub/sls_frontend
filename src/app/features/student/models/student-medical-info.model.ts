export interface StudentMedicalInfo {
  id: number;
  studentId: number;
  bloodGroup: string | null;
  medicalConditions: string | null;
  allergies: string | null;
  treatments: string | null;
  emergencyNotes: string | null;
  updatedAt: string;
}
export type StudentMedicalInfoRequest = Omit<
  StudentMedicalInfo,
  'id' | 'studentId' | 'updatedAt'
>;
