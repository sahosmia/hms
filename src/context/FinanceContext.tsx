import { createContext, useContext, useState, useEffect } from 'react';
import type { Bill, BillItem, WeeklyRevenue, DepartmentRevenue, MonthlyTrend } from '../types';

interface FinanceContextType {
  bills: Bill[];
  weeklyRevenue: WeeklyRevenue[];
  departmentRevenue: DepartmentRevenue[];
  monthlyTrends: MonthlyTrend[];
  createBillForAdmission: (patientId: string, patientName: string, admissionId: string) => Bill;
  addServiceDebitItem: (patientId: string, item: Omit<BillItem, 'id' | 'createdAt'>) => void;
  checkoutBill: (billId: string, paymentMethod: string) => void;
  postDailyBedCharges: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const initialWeeklyRevenue: WeeklyRevenue[] = [
  { day: 'Mon', revenue: 45000 },
  { day: 'Tue', revenue: 52000 },
  { day: 'Wed', revenue: 49000 },
  { day: 'Thu', revenue: 64000 },
  { day: 'Fri', revenue: 58000 },
  { day: 'Sat', revenue: 72000 },
  { day: 'Sun', revenue: 61000 },
];

const initialDepartmentRevenue: DepartmentRevenue[] = [
  { department: 'OPD Consultation', revenue: 145000 },
  { department: 'IPD Cabin/Wards', revenue: 230000 },
  { department: 'OT / Surgery', revenue: 310000 },
  { department: 'Diagnostics / Lab', revenue: 120000 },
  { department: 'Pharmacy / Supply', revenue: 85000 },
];

const initialMonthlyTrends: MonthlyTrend[] = [
  { month: 'Jan', revenue: 450000, expenses: 310000, profit: 140000 },
  { month: 'Feb', revenue: 480000, expenses: 320000, profit: 160000 },
  { month: 'Mar', revenue: 510000, expenses: 340000, profit: 170000 },
  { month: 'Apr', revenue: 540000, expenses: 350000, profit: 190000 },
  { month: 'May', revenue: 600000, expenses: 380000, profit: 220000 },
  { month: 'Jun', revenue: 650000, expenses: 400000, profit: 250000 },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    const stored = localStorage.getItem('hms_bills');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('hms_bills', JSON.stringify(bills));
  }, [bills]);

  const createBillForAdmission = (patientId: string, patientName: string, admissionId: string) => {
    const existing = bills.find(b => b.admissionId === admissionId);
    if (existing) return existing;

    const newBill: Bill = {
      id: `bill-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      patientName,
      admissionId,
      appointmentId: null,
      surgeryId: null,
      items: [],
      totalAmount: 0,
      status: 'Unpaid',
      paymentMethod: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBills(prev => [newBill, ...prev]);
    return newBill;
  };

  const addServiceDebitItem = (patientId: string, itemData: Omit<BillItem, 'id' | 'createdAt'>) => {
    const newItem: BillItem = {
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      ...itemData,
      createdAt: new Date().toISOString()
    };

    setBills(prev => {
      const unpaidBillIdx = prev.findIndex(b => b.patientId === patientId && b.status === 'Unpaid');
      if (unpaidBillIdx !== -1) {
        const bill = prev[unpaidBillIdx];
        const updatedItems = [...bill.items, newItem];
        const updatedTotal = updatedItems.reduce((sum, i) => sum + i.amount, 0);
        const updated = [...prev];
        updated[unpaidBillIdx] = {
          ...bill,
          items: updatedItems,
          totalAmount: updatedTotal,
          updatedAt: new Date().toISOString()
        };
        return updated;
      } else {
        const newBill: Bill = {
          id: `bill-${Math.random().toString(36).substr(2, 9)}`,
          patientId,
          patientName: 'Arif Ahmed',
          admissionId: null,
          appointmentId: null,
          surgeryId: null,
          items: [newItem],
          totalAmount: newItem.amount,
          status: 'Unpaid',
          paymentMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [newBill, ...prev];
      }
    });
  };

  const checkoutBill = (billId: string, paymentMethod: string) => {
    setBills(prev =>
      prev.map(b => (b.id === billId ? {
        ...b,
        status: 'Paid',
        paymentMethod,
        updatedAt: new Date().toISOString()
      } : b))
    );
  };

  const postDailyBedCharges = () => {
    const beds = JSON.parse(localStorage.getItem('hms_beds') || '[]');
    const activeAdmitted = beds.filter((b: any) => b.status === 'Occupied' && b.patientId);

    setBills(prev => {
      return prev.map(bill => {
        if (bill.status === 'Unpaid' && bill.admissionId) {
          const matchBed = activeAdmitted.find((b: any) => b.patientId === bill.patientId);
          if (matchBed) {
            const bedChargeItem: BillItem = {
              id: `item-${Math.random().toString(36).substr(2, 9)}`,
              description: `Daily Bed Charge: ${matchBed.name} (${matchBed.type})`,
              amount: matchBed.dailyCharge,
              type: 'Bed Charge',
              createdAt: new Date().toISOString()
            };
            const updatedItems = [...bill.items, bedChargeItem];
            return {
              ...bill,
              items: updatedItems,
              totalAmount: updatedItems.reduce((sum, i) => sum + i.amount, 0),
              updatedAt: new Date().toISOString()
            };
          }
        }
        return bill;
      });
    });
  };

  return (
    <FinanceContext.Provider value={{
      bills,
      weeklyRevenue: initialWeeklyRevenue,
      departmentRevenue: initialDepartmentRevenue,
      monthlyTrends: initialMonthlyTrends,
      createBillForAdmission,
      addServiceDebitItem,
      checkoutBill,
      postDailyBedCharges
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
