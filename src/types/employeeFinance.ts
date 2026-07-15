export interface SalaryDetails {
  employeeId: string;
  baseSalary: number;
  bonus: number;
  overtime: number;
  due: number;
  loan: number;
  decrease: number; // deductions
}

export interface PaymentHistoryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  amountPaid: number;
  bonusPaid: number;
  overtimePaid: number;
  deductions: number;
  paymentDate: string;
  paymentMethod: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
}
