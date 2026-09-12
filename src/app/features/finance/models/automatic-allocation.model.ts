export interface AutomaticAllocationRequest {
  guardianId: number;
  schoolYearId: number | null;
  amount: number;
}

export interface AutomaticAllocationLine {
  studentChargeId: number;
  studentId: number;
  studentNumber: string;
  studentLastName: string;
  studentFirstName: string;
  label: string;
  dueDate: string | null;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  remainingBefore: number;
  allocatedAmount: number;
  remainingAfter: number;
  fullyPaid: boolean;
}

export interface AutomaticAllocationResponse {
  guardianId: number;
  schoolYearId: number | null;
  receivedAmount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  affectedCharges: number;
  allocations: AutomaticAllocationLine[];
}
