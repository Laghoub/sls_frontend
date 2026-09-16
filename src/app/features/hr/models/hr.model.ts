export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'ENDED';
export type TeacherStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'ENDED';
export type CompensationType = 'MONTHLY' | 'HOURLY' | 'MIXED';

export interface JobPosition {
  id: number;
  code: string;
  name: string;
  category: string | null;
  active: boolean;
  displayOrder: number | null;
}
export interface JobPositionRequest { code: string; name: string; category: string | null; active: boolean; displayOrder: number | null; }

export interface SubjectReference { id: number; code: string; name: string; active: boolean; displayOrder?: number | null; }
export interface SubjectRequest { code: string; name: string; active: boolean; displayOrder: number | null; }

export interface Employee {
  id: number;
  personId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  positionId: number | null;
  positionCode: string | null;
  positionTitle: string;
  campusId: number | null;
  campusName: string | null;
  hireDate: string | null;
  endDate: string | null;
  status: EmploymentStatus;
  hasUserAccount: boolean;
}

export interface EmployeeRequest {
  personId: number;
  socialSecurityNumber: string | null;
  positionId: number | null;
  positionTitle: string | null;
  campusId: number | null;
  hireDate: string | null;
  endDate: string | null;
  employmentStatus: EmploymentStatus;
  maritalStatus: string | null;
}

export interface Teacher { id:number; employeeId:number; employeeNumber:string; firstName:string; lastName:string; positionTitle:string; status:TeacherStatus; subjects:SubjectReference[]; }
export interface TeacherRequest { employeeId:number; status:TeacherStatus; }
export interface TeachingAssignment { id:number; schoolYearId:number; schoolYear:string; teacherId:number; teacherName:string; subjectId:number; subjectName:string; classGroupId:number; classGroupName:string; startDate:string; endDate:string|null; status:string; }
export interface TeachingAssignmentRequest { schoolYearId:number; teacherId:number; subjectId:number; classGroupId:number; startDate:string; endDate:string|null; }
export interface CompensationPlan { id:number; employeeId:number; schoolYearId:number|null; type:CompensationType; monthlySalary:number|null; hourlyRate:number|null; fixedPart:number|null; expectedMonthlyHours:number|null; effectiveFrom:string; effectiveUntil:string|null; status:string; }
export interface CompensationPlanRequest { employeeId:number; schoolYearId:number|null; compensationType:CompensationType; monthlySalary:number|null; hourlyRate:number|null; fixedPart:number|null; expectedMonthlyHours:number|null; effectiveFrom:string; effectiveUntil:string|null; }
export interface TeacherRate { id:number; teacherId:number; schoolYearId:number; classGroupId:number|null; classGroupName:string|null; subjectId:number|null; subjectName:string|null; workType:string; hourlyRate:number; effectiveFrom:string; effectiveUntil:string|null; active:boolean; }
export interface TeacherRateRequest { teacherId:number; schoolYearId:number; classGroupId:number|null; subjectId:number|null; workType:string; hourlyRate:number; effectiveFrom:string; effectiveUntil:string|null; }
export interface HrDashboard { employees:number; teachers:number; activeTeachers:number; onLeaveTeachers:number; suspendedTeachers:number; teachersWithoutSubjects:number; teachersWithoutAssignments:number; byCampus:Record<string,number>; bySubject:Record<string,number>; byCompensationType:Record<string,number>; workloads:TeacherWorkload[]; }
export interface TeacherWorkload { teacherId:number; teacherName:string; assignmentCount:number; subjectCount:number; classCount:number; }
export interface EmployeeProfile { qualifications:any[]; employmentHistory:any[]; contracts:any[]; emergencyContacts:any[]; documents:any[]; notes:any[]; }
export interface QualificationRequest { qualificationType:string|null; title:string; institution:string|null; specialty:string|null; obtainedDate:string|null; description:string|null; }
export interface HistoryRequest { institutionName:string; positionTitle:string|null; startDate:string|null; endDate:string|null; description:string|null; }
export interface ContractRequest { contractNumber:string|null; contractType:string; startDate:string; endDate:string|null; positionTitle:string|null; workloadType:string|null; weeklyHours:number|null; status:string|null; notes:string|null; }
export interface EmergencyContactRequest { name:string; relationship:string|null; phone:string; secondaryPhone:string|null; primaryContact:boolean; }
export interface AdminDocumentRequest { documentType:string; documentNumber:string|null; issuedOn:string|null; expiresOn:string|null; fileReference:string|null; status:string|null; notes:string|null; }
export interface StaffNoteRequest { category:string; content:string; }
