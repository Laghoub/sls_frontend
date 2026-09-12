export type BillingTargetType =
  | 'STUDENT'
  | 'SELECTED_STUDENTS'
  | 'CLASS_GROUP'
  | 'LEVEL'
  | 'CYCLE';

export interface TariffBillingRequest {
  tariffId: number;
  targetType: BillingTargetType;
  targetId: number | null;
  studentIds: number[];
  dueDate: string | null;
}

export interface BillingPreviewLine {
  enrollmentId: number;
  studentId: number;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  classGroupId: number;
  classGroupName: string;
  levelId: number;
  levelName: string;
  cycleId: number;
  cycleName: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  alreadyExists: boolean;
}

export interface BillingPreview {
  tariffId: number;
  feeTypeId: number;
  feeTypeCode: string;
  feeTypeName: string;
  billingFrequency: string;
  studentCount: number;
  chargeCount: number;
  duplicateCount: number;
  totalAmount: number;
  lines: BillingPreviewLine[];
}

export interface BillingCreationResponse {
  tariffId: number;
  createdCount: number;
  skippedCount: number;
  createdAmount: number;
  chargeIds: number[];
}
