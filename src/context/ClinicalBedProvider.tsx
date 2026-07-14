import { createContext, useContext, useState, useEffect } from 'react';
import type { Bed, Admission, MedicationLog, Vitals } from '../types';

interface ClinicalBedContextType {
  beds: Bed[];
  admissions: Admission[];
  medicationLogs: MedicationLog[];
  admitPatient: (patientId: string, patientName: string, bedId: string, reason: string) => { success: boolean; message: string; admission?: Admission };
  dischargePatient: (admissionId: string) => { success: boolean; message: string };
  updateBedStatus: (bedId: string, status: Bed['status']) => void;
  addMedicationLog: (data: {
    admissionId: string | null;
    patientId: string;
    patientName: string;
    medicineName: string;
    dosage: string;
    nurseName: string;
    vitals: Vitals;
  }) => void;
}

const ClinicalBedContext = createContext<ClinicalBedContextType | undefined>(undefined);

const defaultBeds: Bed[] = [
  { id: 'bed-w101', name: 'Ward Bed 101', type: 'Ward', status: 'Available', patientId: null, patientName: null, dailyCharge: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-w102', name: 'Ward Bed 102', type: 'Ward', status: 'Available', patientId: null, patientName: null, dailyCharge: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-w103', name: 'Ward Bed 103', type: 'Ward', status: 'Maintenance', patientId: null, patientName: null, dailyCharge: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-w104', name: 'Ward Bed 104', type: 'Ward', status: 'Available', patientId: null, patientName: null, dailyCharge: 500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-icu201', name: 'ICU Bed 201', type: 'ICU', status: 'Available', patientId: null, patientName: null, dailyCharge: 3500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-icu202', name: 'ICU Bed 202', type: 'ICU', status: 'Available', patientId: null, patientName: null, dailyCharge: 3500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-icu203', name: 'ICU Bed 203', type: 'ICU', status: 'Available', patientId: null, patientName: null, dailyCharge: 3500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-icu204', name: 'ICU Bed 204', type: 'ICU', status: 'Available', patientId: null, patientName: null, dailyCharge: 3500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-cab301', name: 'Cabin 301', type: 'Cabin', status: 'Available', patientId: null, patientName: null, dailyCharge: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-cab302', name: 'Cabin 302', type: 'Cabin', status: 'Available', patientId: null, patientName: null, dailyCharge: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-cab303', name: 'Cabin 303', type: 'Cabin', status: 'Available', patientId: null, patientName: null, dailyCharge: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-cab304', name: 'Cabin 304', type: 'Cabin', status: 'Available', patientId: null, patientName: null, dailyCharge: 2000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-ccu401', name: 'CCU Bed 401', type: 'CCU', status: 'Available', patientId: null, patientName: null, dailyCharge: 4000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-ccu402', name: 'CCU Bed 402', type: 'CCU', status: 'Available', patientId: null, patientName: null, dailyCharge: 4000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-ccu403', name: 'CCU Bed 403', type: 'CCU', status: 'Available', patientId: null, patientName: null, dailyCharge: 4000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bed-ccu404', name: 'CCU Bed 404', type: 'CCU', status: 'Available', patientId: null, patientName: null, dailyCharge: 4000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const ClinicalBedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beds, setBeds] = useState<Bed[]>(() => {
    const stored = localStorage.getItem('hms_beds');
    return stored ? JSON.parse(stored) : defaultBeds;
  });

  const [admissions, setAdmissions] = useState<Admission[]>(() => {
    const stored = localStorage.getItem('hms_admissions');
    return stored ? JSON.parse(stored) : [];
  });

  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>(() => {
    const stored = localStorage.getItem('hms_medication_logs');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('hms_beds', JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem('hms_admissions', JSON.stringify(admissions));
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem('hms_medication_logs', JSON.stringify(medicationLogs));
  }, [medicationLogs]);

  const admitPatient = (patientId: string, patientName: string, bedId: string, reason: string) => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed) {
      return { success: false, message: 'Bed not found.' };
    }
    if (bed.status !== 'Available') {
      return { success: false, message: `Bed is currently ${bed.status}.` };
    }

    setBeds(prev =>
      prev.map(b => (b.id === bedId ? { ...b, status: 'Occupied', patientId, patientName, updatedAt: new Date().toISOString() } : b))
    );

    const now = new Date();
    const admittedAtStr = now.toISOString().slice(0, 16).replace('T', ' ');

    const newAdmission: Admission = {
      id: `adm-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      patientName,
      bedId,
      bedName: bed.name,
      admittedAt: admittedAtStr,
      dischargedAt: null,
      status: 'admitted',
      reason,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setAdmissions(prev => [newAdmission, ...prev]);

    return {
      success: true,
      message: `রোগীকে সফলভাবে ${bed.name}-এ ভর্তি করা হয়েছে।`,
      admission: newAdmission
    };
  };

  const dischargePatient = (admissionId: string) => {
    const admission = admissions.find(a => a.id === admissionId);
    if (!admission || admission.status === 'discharged') {
      return { success: false, message: 'Admission not found or patient already discharged.' };
    }

    const now = new Date();
    const dischargedAtStr = now.toISOString().slice(0, 16).replace('T', ' ');

    setAdmissions(prev =>
      prev.map(a => (a.id === admissionId ? { ...a, status: 'discharged', dischargedAt: dischargedAtStr, updatedAt: now.toISOString() } : a))
    );

    setBeds(prev =>
      prev.map(b => (b.id === admission.bedId ? { ...b, status: 'Available', patientId: null, patientName: null, updatedAt: now.toISOString() } : b))
    );

    return {
      success: true,
      message: 'রোগীকে সফলভাবে রিলিজ/ডিসচার্জ করা হয়েছে এবং বেডটি খালি করা হয়েছে।'
    };
  };

  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setBeds(prev =>
      prev.map(b => {
        if (b.id === bedId) {
          const isFlippedToFree = status === 'Available';
          return {
            ...b,
            status,
            patientId: isFlippedToFree ? null : b.patientId,
            patientName: isFlippedToFree ? null : b.patientName,
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    );
  };

  const addMedicationLog = (data: {
    admissionId: string | null;
    patientId: string;
    patientName: string;
    medicineName: string;
    dosage: string;
    nurseName: string;
    vitals: Vitals;
  }) => {
    const newLog: MedicationLog = {
      id: `med-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setMedicationLogs(prev => [newLog, ...prev]);
  };

  return (
    <ClinicalBedContext.Provider value={{
      beds,
      admissions,
      medicationLogs,
      admitPatient,
      dischargePatient,
      updateBedStatus,
      addMedicationLog
    }}>
      {children}
    </ClinicalBedContext.Provider>
  );
};

export const useClinicalBeds = () => {
  const context = useContext(ClinicalBedContext);
  if (!context) {
    throw new Error('useClinicalBeds must be used within a ClinicalBedProvider');
  }
  return context;
};
