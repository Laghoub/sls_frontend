export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'NEW_AMOUNT';
export type DiscountStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type DiscountConditionType = 'ALWAYS' | 'FAMILY_CHILD_RANK';

export interface StudentDiscountRequest {
  studentEnrollmentId: number;
  feeTypeId: number | null;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string | null;
  reason: string | null;
}

export interface StudentDiscount {
  id: number;
  studentEnrollmentId: number;
  feeTypeId: number | null;
  discountType: DiscountType;
  value: number;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  status: DiscountStatus;
  createdBy: number;
  createdAt: string;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectedBy: number | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  appliedAt: string | null;
}

export interface DiscountRejectRequest { reason: string; }

export interface DiscountRuleRequest {
  schoolYearId: number;
  code: string;
  name: string;
  discountType: DiscountType;
  value: number;
  feeTypeId: number | null;
  priority: number;
  requiresApproval: boolean;
  active: boolean;
  validFrom: string | null;
  validUntil: string | null;
  conditionType: DiscountConditionType;
  childRank: number | null;
  cycleId: number | null;
  levelId: number | null;
  classGroupId: number | null;
  campusId: number | null;
}

export interface DiscountRule extends DiscountRuleRequest { id: number; }

export interface DiscountApplicationResponse {
  chargesUpdated: number;
  totalReductionApplied: number;
  familyCreditCreated: number;
}
