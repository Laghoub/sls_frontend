export interface FeeType {
  id: number;
  code: string;
  name: string;
  category: string;
  active: boolean;
  displayOrder: number | null;
}
export interface FeeTypeRequest {
  code: string;
  name: string;
  category: string;
  active: boolean;
  displayOrder: number | null;
}

export interface Tariff {
  id: number;
  schoolYearId: number;
  feeTypeId: number;
  cycleId: number | null;
  levelId: number | null;
  classGroupId: number | null;
  campusId: number | null;
  amount: number;
  billingFrequency: string;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface TariffRequest {
  schoolYearId: number;
  feeTypeId: number;
  cycleId: number | null;
  levelId: number | null;
  classGroupId: number | null;
  campusId: number | null;
  amount: number;
  billingFrequency: string;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
}

export interface StudentCharge {
  id: number;
  studentEnrollmentId: number | null;
  registrationCaseId: number | null;
  feeTypeId: number;
  tariffId: number | null;
  label: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  status: string;
  createdAt: string;
}
export interface StudentChargeCreateRequest {
  studentEnrollmentId: number | null;
  registrationCaseId: number | null;
  feeTypeId: number;
  tariffId: number | null;
  label: string;
  originalAmount: number;
  discountAmount: number;
  dueDate: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
}

export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  active: boolean;
}
export interface PaymentMethodRequest {
  code: string;
  name: string;
  active: boolean;
}

export interface PaymentAllocationRequest {
  studentChargeId: number;
  amount: number;
}
export interface PaymentAllocation {
  id: number;
  paymentId: number;
  studentChargeId: number;
  amount: number;
  createdAt: string;
}
export interface Payment {
  id: number;
  paymentNumber: string;
  guardianId: number;
  paymentDate: string;
  paymentMethodId: number;
  totalAmount: number;
  status: string;
  cashierId: number;
  cashRegisterSessionId: number | null;
  externalReference: string | null;
  notes: string | null;
  createdAt: string;
}
export interface PaymentCreateRequest {
  guardianId: number;
  paymentDate: string | null;
  paymentMethodId: number;
  totalAmount: number;
  cashRegisterSessionId: number | null;
  externalReference: string | null;
  notes: string | null;
  allocations: PaymentAllocationRequest[];
}
export interface FamilyCredit {
  id: number;
  guardianId: number;
  sourcePaymentId: number | null;
  sourceStudentDiscountId?: number | null;
  sourceType?: string;
  initialAmount: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}
export interface PaymentDetail {
  payment: Payment;
  allocations: PaymentAllocation[];
  generatedCredit: FamilyCredit | null;
}

export interface CashRegister {
  id: number;
  code: string;
  name: string;
  campusId: number | null;
  active: boolean;
}
export interface CashRegisterRequest {
  code: string;
  name: string;
  campusId: number | null;
  active: boolean;
}
export interface CashRegisterSession {
  id: number;
  cashRegisterId: number;
  cashierId: number;
  openedAt: string;
  openingBalance: number;
  closedAt: string | null;
  expectedClosingBalance: number | null;
  actualClosingBalance: number | null;
  differenceAmount: number | null;
  status: string;
  closedBy: number | null;
}
export interface CashSessionOpenRequest {
  cashRegisterId: number;
  openingBalance: number;
}
export interface CashSessionCloseRequest {
  actualClosingBalance: number;
}

export interface CashMovement {
  id: number;
  cashRegisterSessionId: number;
  movementType: string;
  direction: string;
  amount: number;
  paymentId: number | null;
  refundId: number | null;
  reference: string | null;
  description: string | null;
  createdBy: number;
  createdAt: string;
}
export interface CashMovementRequest {
  cashRegisterSessionId: number;
  movementType: string;
  direction: string;
  amount: number;
  reference: string | null;
  description: string | null;
}

export interface Refund {
  id: number;
  paymentId: number;
  refundDate: string;
  amount: number;
  paymentMethodId: number;
  reason: string;
  status: string;
  createdBy: number;
  validatedBy: number | null;
  validatedAt: string | null;
  createdAt: string;
  creditReversedAmount: number;
  allocationReversedAmount: number;
}
export interface RefundRequest {
  paymentId: number;
  amount: number;
  paymentMethodId: number;
  reason: string;
  cashRegisterSessionId: number | null;
}
