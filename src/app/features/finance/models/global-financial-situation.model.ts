export type GlobalPaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'UPCOMING' | 'NOT_APPLICABLE';

export interface GlobalPaymentCell {
  key: string;
  label: string;
  expected: number;
  paid: number;
  remaining: number;
  status: GlobalPaymentStatus;
  overdue: boolean;
}

export interface GlobalSituationChild {
  studentId: number;
  studentNumber: string;
  lastName: string;
  firstName: string;
  classGroupId: number | null;
  className: string | null;
}

export interface GlobalSituationFamily {
  guardianId: number;
  guardianLastName: string;
  guardianFirstName: string;
  phone: string | null;
  email: string | null;
  children: GlobalSituationChild[];
  registration: GlobalPaymentCell;
  months: GlobalPaymentCell[];
  expectedToDate: number;
  paidToDate: number;
  remainingToDate: number;
  globalStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface GlobalSituationSummary {
  expectedAnnual: number;
  expectedToDate: number;
  collected: number;
  remainingToDate: number;
  overdue: number;
  availableCredits: number;
  collectionRate: number;
  familiesCount: number;
  familiesUpToDate: number;
  familiesWithDebt: number;
}

export interface GlobalFinancialSituation {
  schoolYearId: number;
  cutoffMonth: number;
  summary: GlobalSituationSummary;
  families: GlobalSituationFamily[];
}

export interface GlobalSituationFilters {
  schoolYearId: number | null;
  classGroupId: number | null;
  parent: string;
  cutoffMonth: number;
  status: string;
}
