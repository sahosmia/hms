export interface DiagnosticTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;      // e.g., "Complete Blood Count (CBC)", "ECG", "Chest X-Ray", "MRI Brain"
  category: string;      // "Hematology", "Cardiology", "Radiology", "Biochemistry"
  referredBy: string;    // Doctor name
  status: 'ordered' | 'sample-collected' | 'processing' | 'completed' | 'cancelled';
  fees: number;          // Cost in BDT
  reportResults: string; // Findings / notes
  testDate: string;      // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
