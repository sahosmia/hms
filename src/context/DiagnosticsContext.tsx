import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DiagnosticTest } from '../types/diagnostic';

interface DiagnosticsContextType {
  diagnosticTests: DiagnosticTest[];
  addDiagnosticTest: (testData: Omit<DiagnosticTest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestStatus: (id: string, status: DiagnosticTest['status'], results?: string) => void;
  deleteTest: (id: string) => void;
}

const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(undefined);

const initialTests: DiagnosticTest[] = [
  {
    id: 'dia-101',
    patientId: 'pat-99',
    patientName: 'Josim Uddin',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    referredBy: 'Dr. Ashraful Islam',
    status: 'completed',
    fees: 450,
    reportResults: 'Hemoglobin: 14.2 g/dL (Normal). Platelets and WBC count within physiological limits.',
    testDate: '2026-07-14',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dia-102',
    patientId: 'pat-102',
    patientName: 'Khadiza Begum',
    testName: 'Electrocardiogram (ECG)',
    category: 'Cardiology',
    referredBy: 'Dr. Sabrina Khan',
    status: 'ordered',
    fees: 800,
    reportResults: '',
    testDate: '2026-07-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dia-103',
    patientId: 'pat-103',
    patientName: 'Rahim Sheikh',
    testName: 'Chest X-Ray (PA View)',
    category: 'Radiology',
    referredBy: 'Dr. Mostafizur Rahman',
    status: 'processing',
    fees: 1200,
    reportResults: '',
    testDate: '2026-07-14',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DiagnosticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>(() => {
    const stored = localStorage.getItem('hms_diagnostics');
    return stored ? JSON.parse(stored) : initialTests;
  });

  useEffect(() => {
    localStorage.setItem('hms_diagnostics', JSON.stringify(diagnosticTests));
  }, [diagnosticTests]);

  const addDiagnosticTest = (testData: Omit<DiagnosticTest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTest: DiagnosticTest = {
      ...testData,
      id: `dia-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDiagnosticTests(prev => [newTest, ...prev]);
  };

  const updateTestStatus = (id: string, status: DiagnosticTest['status'], results?: string) => {
    setDiagnosticTests(prev =>
      prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status,
            reportResults: results !== undefined ? results : t.reportResults,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );
  };

  const deleteTest = (id: string) => {
    setDiagnosticTests(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DiagnosticsContext.Provider value={{ diagnosticTests, addDiagnosticTest, updateTestStatus, deleteTest }}>
      {children}
    </DiagnosticsContext.Provider>
  );
};

export const useDiagnostics = () => {
  const context = useContext(DiagnosticsContext);
  if (!context) {
    throw new Error('useDiagnostics must be used within a DiagnosticsProvider');
  }
  return context;
};
