import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Staff } from '../types';

interface StaffContextType {
  staffList: Staff[];
  addStaff: (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStaffDetails: (id: string, staffData: Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  updateSalary: (id: string, salary: number) => void;
  updateStatus: (id: string, status: Staff['status']) => void;
  deleteStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const initialStaff: Staff[] = [
  {
    id: 'stf-101',
    name: 'Dilara Begum',
    role: 'Nurse',
    department: 'Emergency & Trauma',
    monthlySalary: 35000,
    status: 'Active',
    joinedDate: '2023-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-102',
    name: 'Dr. Imtiaz Ahmed',
    role: 'Doctor',
    department: 'Cardiology',
    monthlySalary: 120000,
    status: 'Active',
    joinedDate: '2021-06-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-103',
    name: 'Jahid Hasan',
    role: 'Administrator',
    department: 'Finance & HR',
    monthlySalary: 55000,
    status: 'Active',
    joinedDate: '2022-09-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-104',
    name: 'Nusrat Jahan',
    role: 'Nurse',
    department: 'General Ward A',
    monthlySalary: 32000,
    status: 'Active',
    joinedDate: '2024-02-18',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-105',
    name: 'Ariful Islam',
    role: 'Lab Technician',
    department: 'Diagnostics',
    monthlySalary: 28000,
    status: 'On Leave',
    joinedDate: '2023-11-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-106',
    name: 'Tania Sultana',
    role: 'Receptionist',
    department: 'Outpatient Front Desk',
    monthlySalary: 22000,
    status: 'Active',
    joinedDate: '2024-05-12',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stf-107',
    name: 'Milon Sheikh',
    role: 'Pharmacist',
    department: 'Main Pharmacy',
    monthlySalary: 38000,
    status: 'Active',
    joinedDate: '2022-12-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const stored = localStorage.getItem('hms_staff');
    return stored ? JSON.parse(stored) : initialStaff;
  });

  useEffect(() => {
    localStorage.setItem('hms_staff', JSON.stringify(staffList));
  }, [staffList]);

  const addStaff = (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: `stf-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setStaffList(prev => [newStaff, ...prev]);
  };

  const updateStaffDetails = (id: string, updatedFields: Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setStaffList(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedFields, updatedAt: new Date().toISOString() } : s))
    );
  };

  const updateSalary = (id: string, salary: number) => {
    setStaffList(prev =>
      prev.map(s => (s.id === id ? { ...s, monthlySalary: salary, updatedAt: new Date().toISOString() } : s))
    );
  };

  const updateStatus = (id: string, status: Staff['status']) => {
    setStaffList(prev =>
      prev.map(s => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    );
  };

  const deleteStaff = (id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  };

  return (
    <StaffContext.Provider value={{ staffList, addStaff, updateStaffDetails, updateSalary, updateStatus, deleteStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
