export interface PayrollCalculateRequest {
  teacherId: number;
  schoolYearId: number;
  year: number;
  month: number;
  absenceDeduction?: number | null;
}

export interface PayrollAttendanceLine {
  attendanceId: number;
  date: string;
  className: string;
  subjectName: string;
  timeRange: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'RETARD' | string;
  lateMinutes: number;
  scheduledMinutes: number;
  paidMinutes: number;
  appliedHourlyRate: number;
  amount: number;
}

export interface PayrollPeriod {
  id: number;
  schoolYearId: number | null;
  schoolYear: string | null;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Payroll {
  id: number;
  teacherId: number;
  employeeId: number;
  employeeNumber: string;
  teacherName: string;
  teacherEmail: string | null;
  payrollPeriodId: number;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  compensationType: 'MONTHLY' | 'HOURLY' | 'MIXED' | string;
  baseSalary: number;
  fixedPart: number;
  defaultHourlyRate: number | null;
  presentSessions: number;
  absentSessions: number;
  lateSessions: number;
  totalLateMinutes: number;
  regularHours: number;
  hourlyAmount: number;
  absenceDeduction: number;
  bonusTotal: number;
  deductionTotal: number;
  reimbursementTotal: number;
  grossSalary: number;
  netSalary: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  versionNumber: number;
  calculatedAt: string;
  attendanceLines: PayrollAttendanceLine[];
}

export interface SalaryPaymentRequest {
  amount: number;
  paymentMethodId: number;
  cashRegisterSessionId: number | null;
  reference: string | null;
}

export interface SalaryPaymentReceipt {
  salaryPaymentId: number;
  receiptNumber: string;
  payrollId: number;
  payslipNumber: string | null;
  employeeNumber: string;
  teacherName: string;
  teacherEmail: string | null;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  compensationType: string;
  baseSalary: number;
  fixedPart: number;
  regularHours: number;
  hourlyAmount: number;
  absenceDeduction: number;
  grossSalary: number;
  netSalary: number;
  paymentAmount: number;
  totalPaid: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentReference: string | null;
  paymentDate: string;
  status: string;
}
