import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SalaryDetails, PaymentHistoryRecord, ExpenseItem } from '../types/employeeFinance';

interface EmployeeFinanceContextType {
  salaryDetailsList: SalaryDetails[];
  paymentHistory: PaymentHistoryRecord[];
  expenses: ExpenseItem[];
  getSalaryDetails: (employeeId: string, baseSalary: number) => SalaryDetails;
  updateSalaryDetails: (employeeId: string, updates: Partial<SalaryDetails>) => void;
  paySalary: (employeeId: string, employeeName: string, baseSalary: number, paymentMethod: string) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;
}

const EmployeeFinanceContext = createContext<EmployeeFinanceContextType | undefined>(undefined);

export const EmployeeFinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salaryDetailsList, setSalaryDetailsList] = useState<SalaryDetails[]>(() => {
    const stored = localStorage.getItem('hms_salary_details');
    return stored ? JSON.parse(stored) : [];
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>(() => {
    const stored = localStorage.getItem('hms_payment_history');
    return stored ? JSON.parse(stored) : [];
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const stored = localStorage.getItem('hms_expenses');
    return stored ? JSON.parse(stored) : [
      { id: 'exp-1', description: 'Oxygen Cylinder Refill', amount: 15000, category: 'Medical Supplies', date: '2026-07-10', addedBy: 'Admin' },
      { id: 'exp-2', description: 'Surgical Gloves procurement', amount: 8000, category: 'OT Equipment', date: '2026-07-12', addedBy: 'Admin' },
      { id: 'exp-3', description: 'Broadband Internet bill', amount: 2500, category: 'Utility', date: '2026-07-13', addedBy: 'Admin' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hms_salary_details', JSON.stringify(salaryDetailsList));
  }, [salaryDetailsList]);

  useEffect(() => {
    localStorage.setItem('hms_payment_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  useEffect(() => {
    localStorage.setItem('hms_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const getSalaryDetails = (employeeId: string, baseSalary: number): SalaryDetails => {
    const found = salaryDetailsList.find(s => s.employeeId === employeeId);
    if (found) return found;

    const newRecord: SalaryDetails = {
      employeeId,
      baseSalary,
      bonus: 0,
      overtime: 0,
      due: 0,
      loan: 0,
      decrease: 0
    };
    // Save it
    setSalaryDetailsList(prev => [...prev, newRecord]);
    return newRecord;
  };

  const updateSalaryDetails = (employeeId: string, updates: Partial<SalaryDetails>) => {
    setSalaryDetailsList(prev => {
      const idx = prev.findIndex(s => s.employeeId === employeeId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      } else {
        return [...prev, {
          employeeId,
          baseSalary: updates.baseSalary || 30000,
          bonus: updates.bonus || 0,
          overtime: updates.overtime || 0,
          due: updates.due || 0,
          loan: updates.loan || 0,
          decrease: updates.decrease || 0,
          ...updates
        }];
      }
    });
  };

  const paySalary = (employeeId: string, employeeName: string, baseSalary: number, paymentMethod: string) => {
    const details = getSalaryDetails(employeeId, baseSalary);
    const grossPaid = details.baseSalary + details.bonus + details.overtime + details.due - details.decrease - details.loan;

    const newRecord: PaymentHistoryRecord = {
      id: `pay-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      employeeName,
      amountPaid: Math.max(0, grossPaid),
      bonusPaid: details.bonus,
      overtimePaid: details.overtime,
      deductions: details.decrease + details.loan,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod
    };

    setPaymentHistory(prev => [newRecord, ...prev]);

    // Reset current month bonus, overtime, decrease, but accumulate or handle loan/due if desired
    // Here we clean bonus, overtime, decrease, loan, and due since they've been processed/paid
    updateSalaryDetails(employeeId, {
      bonus: 0,
      overtime: 0,
      decrease: 0,
      loan: 0,
      due: 0
    });
  };

  const addExpense = (expenseData: Omit<ExpenseItem, 'id' | 'date'>) => {
    const newExpense: ExpenseItem = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      ...expenseData,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EmployeeFinanceContext.Provider value={{
      salaryDetailsList,
      paymentHistory,
      expenses,
      getSalaryDetails,
      updateSalaryDetails,
      paySalary,
      addExpense,
      deleteExpense
    }}>
      {children}
    </EmployeeFinanceContext.Provider>
  );
};

export const useEmployeeFinance = () => {
  const context = useContext(EmployeeFinanceContext);
  if (!context) {
    throw new Error('useEmployeeFinance must be used within an EmployeeFinanceProvider');
  }
  return context;
};
