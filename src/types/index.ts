export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'patient';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  allergies: string[];
  medicalHistory: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  nid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number; // in years
  rating: number;
  reviewCount: number;
  fees: number;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  holidays: string[]; // ['YYYY-MM-DD']
  availableSlots: string[]; // ['09:00 AM', '10:00 AM', ...]
  imageUrl?: string;
  reviews: DoctorReview[];
}

export interface DoctorReview {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  anonymous: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  serialNumber: string; // e.g. APT-20260714-0001
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  feesPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  name: string;
  type: 'ICU' | 'Ward' | 'Cabin' | 'CCU';
  status: 'Available' | 'Occupied' | 'Maintenance';
  patientId: string | null;
  patientName: string | null;
  dailyCharge: number;
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  bedName: string;
  admittedAt: string; // YYYY-MM-DD HH:mm
  dischargedAt: string | null; // YYYY-MM-DD HH:mm
  status: 'admitted' | 'discharged';
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bp: string; // e.g. "120/80"
  pulse: number; // bpm
  temp: number; // °F
  spo2: number; // %
}

export interface MedicationLog {
  id: string;
  admissionId: string | null;
  patientId: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  nurseName: string;
  vitals: Vitals;
}

export interface ConsumableItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  otRoom: string; // e.g. "OT-01"
  procedure: string;
  date: string; // YYYY-MM-DD
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  surgeonFee: number;
  roomCharge: number;
  consumables: ConsumableItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string; // e.g. "Surgical Supplies", "Medicines", "General"
  stock: number;
  minStock: number; // low-stock trigger threshold
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyRequest {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  id: string;
  description: string;
  amount: number;
  type: 'Bed Charge' | 'Doctor Fee' | 'Surgical Fee' | 'Supply Consumable' | 'Service Debit';
  createdAt: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  admissionId: string | null;
  appointmentId: string | null;
  surgeryId: string | null;
  items: BillItem[];
  totalAmount: number;
  status: 'Unpaid' | 'Paid';
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRevenue {
  department: string;
  revenue: number;
}

export interface WeeklyRevenue {
  day: string; // "Mon", "Tue", etc.
  revenue: number;
}

export interface MonthlyTrend {
  month: string; // "Jan", "Feb", etc.
  revenue: number;
  expenses: number;
  profit: number;
}
