export interface FinancialChargeLine {
  chargeId: number;
  feeTypeId: number;
  feeTypeCode: string;
  feeTypeName: string;
  label: string;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  status: string;
  overdue: boolean;
}

export interface StudentFinancialSituation {
  studentId: number;
  studentNumber: string;
  lastName: string;
  firstName: string;
  schoolYearId: number;
  studentEnrollmentId: number | null;
  classGroupId: number | null;
  totalCharged: number;
  totalPaid: number;
  totalRemaining: number;
  overdueAmount: number;
  charges: FinancialChargeLine[];
}

export interface FamilyFinancialSituation {
  guardianId: number;
  lastName: string;
  firstName: string;
  phone: string | null;
  email: string | null;
  schoolYearId: number;
  totalCharged: number;
  totalPaid: number;
  totalRemaining: number;
  overdueAmount: number;
  availableCredit: number;
  students: StudentFinancialSituation[];
}

export interface OverdueCharge {
  chargeId: number;
  studentId: number;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  guardianId: number | null;
  guardianLastName: string | null;
  guardianFirstName: string | null;
  guardianPhone: string | null;
  label: string;
  dueDate: string | null;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  daysLate: number;
  status: string;
}

export interface FinanceDashboard {
  schoolYearId: number;
  totalCharged: number;
  totalCollected: number;
  totalRemaining: number;
  overdueAmount: number;
  dueChargeCount: number;
  partiallyPaidChargeCount: number;
  paidChargeCount: number;
  overdueChargeCount: number;
  availableFamilyCredit: number;
}

export interface InstallmentGenerationRequest {
  feeTypeId: number | null;
  fromDate: string | null;
  toDate: string | null;
}

export interface InstallmentGenerationResponse {
  studentEnrollmentId: number;
  createdCount: number;
  skippedCount: number;
  createdChargeIds: number[];
}

export interface PaymentReceiptAllocation {
  chargeId: number;
  studentId: number;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  chargeLabel: string;
  amount: number;
}

export interface PaymentReceipt {
  paymentId: number;
  paymentNumber: string;
  paymentDate: string;
  totalAmount: number;
  status: string;
  guardianId: number;
  guardianLastName: string;
  guardianFirstName: string;
  guardianPhone: string | null;
  guardianEmail: string | null;
  paymentMethodId: number;
  paymentMethodCode: string;
  paymentMethodName: string;
  externalReference: string | null;
  allocations: PaymentReceiptAllocation[];
}

export interface FamilyCreditApplyRequest {
  studentChargeId: number;
  amount: number;
}

export interface FamilyCreditUsage {
  id: number;
  familyCreditId: number;
  guardianId: number;
  studentChargeId: number;
  paymentAllocationId: number;
  amount: number;
  createdAt: string;
}
