export interface FinanceDashboardFilters {
  schoolYearId: number | null;
  cycleId: number | null;
  levelId: number | null;
  classGroupId: number | null;
  campusId: number | null;
  feeTypeId: number | null;
  paymentMethodId: number | null;
  from: string | null;
  to: string | null;
}

export interface FinanceDashboardKpis {
  originalCharged: number;
  discountsGranted: number;
  netCharged: number;
  collectedOnCharges: number;
  remainingToCollect: number;
  overdueAmount: number;
  grossPayments: number;
  refunds: number;
  netPayments: number;
  familyCreditAvailable: number;
  collectionRate: number;
  averagePayment: number;
  chargeCount: number;
  dueChargeCount: number;
  partiallyPaidChargeCount: number;
  paidChargeCount: number;
  overdueChargeCount: number;
  paymentCount: number;
  refundCount: number;
  studentCount: number;
  familyCount: number;
}

export interface FinanceDashboardCash {
  openingFunds: number;
  cashInflows: number;
  cashOutflows: number;
  netCashMovement: number;
  expectedClosingTotal: number;
  actualClosingTotal: number;
  totalDifference: number;
  openSessionCount: number;
  closedSessionCount: number;
}

export interface FinanceDashboardEmails {
  sent: number;
  pending: number;
  failedOrRetrying: number;
}

export interface FinanceDashboardBreakdown {
  id: number | null;
  code: string | null;
  label: string;
  charged: number;
  collected: number;
  remaining: number;
  overdue: number;
  chargeCount: number;
}

export interface FinanceDashboardPaymentMethod {
  id: number | null;
  code: string | null;
  label: string;
  amount: number;
  paymentCount: number;
  sharePercent: number;
}

export interface FinanceDashboardMonthlyTrend {
  month: string;
  charged: number;
  collected: number;
  refunds: number;
  netCollected: number;
}

export interface FinanceDashboardChargeStatus {
  status: string;
  count: number;
  amount: number;
  remaining: number;
}

export interface FinanceDashboardDebtor {
  guardianId: number | null;
  guardianName: string;
  phone: string | null;
  studentCount: number;
  remaining: number;
  overdue: number;
}

export interface AdvancedFinanceDashboard {
  filters: FinanceDashboardFilters;
  kpis: FinanceDashboardKpis;
  cash: FinanceDashboardCash;
  emails: FinanceDashboardEmails;
  byFeeType: FinanceDashboardBreakdown[];
  byCycle: FinanceDashboardBreakdown[];
  byLevel: FinanceDashboardBreakdown[];
  byClassGroup: FinanceDashboardBreakdown[];
  byCampus: FinanceDashboardBreakdown[];
  byPaymentMethod: FinanceDashboardPaymentMethod[];
  monthlyTrend: FinanceDashboardMonthlyTrend[];
  chargeStatuses: FinanceDashboardChargeStatus[];
  topDebtors: FinanceDashboardDebtor[];
}
