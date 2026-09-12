export interface GuardianStudentChoice {
  studentId: number;
  studentNumber: string;
  lastName: string;
  firstName: string;
  enrollmentId: number | null;
  schoolYearId: number | null;
  classGroupId: number | null;
  classGroupName: string | null;
  levelName: string | null;
  campusName: string | null;
}

export interface StudentOpenCharge {
  chargeId: number;
  studentId: number;
  studentEnrollmentId: number | null;
  registrationCaseId: number | null;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  label: string;
  feeTypeId: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  status: string;
}
