import React, { useState } from 'react';
import { useDiagnostics } from '../../context/DiagnosticsContext';
import { useAppointments } from '../../context/AppointmentContext';
import { Badge } from '../../components/DataDisplays';
import { PlusCircle, Search, Trash2 } from 'lucide-react';
import type { DiagnosticTest } from '../../types/diagnostic';

export const DiagnosticPanel: React.FC = () => {
  const { diagnosticTests, addDiagnosticTest, updateTestStatus, deleteTest } = useDiagnostics();
  const { doctors } = useAppointments();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);

  // New Test Order Form State
  const [isOrdering, setIsOrdering] = useState(false);
  const [patientId, setPatientId] = useState('pat-101');
  const [patientName, setPatientName] = useState('');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [category, setCategory] = useState('Hematology');
  const [referredBy, setReferredBy] = useState(doctors[0]?.name || 'Dr. Ashraful Islam');
  const [fees, setFees] = useState<number>(500);

  // Results Modal Form State
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);
  const [reportResults, setReportResults] = useState('');

  const handleOrderTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !testName || fees <= 0) return;

    addDiagnosticTest({
      patientId,
      patientName,
      testName,
      category,
      referredBy,
      status: 'ordered',
      fees,
      reportResults: '',
      testDate: new Date().toISOString().split('T')[0]
    });

    setPatientName('');
    setIsOrdering(false);
    alert('Diagnostic test successfully ordered!');
  };

  const handleUpdateStatus = (id: string, status: DiagnosticTest['status']) => {
    updateTestStatus(id, status);
  };

  const handleOpenResultsForm = (test: DiagnosticTest) => {
    setSelectedTest(test);
    setReportResults(test.reportResults);
    setIsUpdatingResults(true);
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    updateTestStatus(selectedTest.id, 'completed', reportResults);
    setIsUpdatingResults(false);
    setSelectedTest(null);
    alert('Diagnostic test report successfully generated and finalized!');
  };

  const filteredTests = diagnosticTests.filter(t => {
    const matchesSearch = t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Diagnostic & Pathology Lab</h3>
          <p className="text-xs text-slate-500">Order diagnostics, capture samples, process biochemical reports, and manage patient clinical findings.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-600 font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="ordered">Ordered</option>
            <option value="sample-collected">Sample Collected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setIsOrdering(true)}
            className="px-3 py-1.5 bg-primary hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Order Test
          </button>
        </div>
      </div>

      {/* Tests Table Ledger */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Patient Details</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Referred By</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Test Details</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Fees</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 italic">No diagnostic test orders found matching the filter criteria.</td>
                </tr>
              ) : (
                filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block">{test.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium block">ID: {test.patientId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-600 block">{test.referredBy}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block">{test.testName}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Category: {test.category}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold font-mono text-slate-700">BDT {test.fees}</td>
                    <td className="px-4 py-3.5">
                      <Badge status={
                        test.status === 'completed' ? 'green' :
                        test.status === 'processing' ? 'yellow' :
                        test.status === 'sample-collected' ? 'blue' :
                        test.status === 'ordered' ? 'gray' : 'red'
                      }>
                        {test.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {test.status === 'ordered' && (
                        <button
                          onClick={() => handleUpdateStatus(test.id, 'sample-collected')}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-[10px] border border-blue-200/50"
                        >
                          Collect Sample
                        </button>
                      )}
                      {test.status === 'sample-collected' && (
                        <button
                          onClick={() => handleUpdateStatus(test.id, 'processing')}
                          className="px-2 py-1 bg-yellow-50 text-amber-600 hover:bg-yellow-100 font-bold rounded-lg text-[10px] border border-yellow-200/50"
                        >
                          Start Process
                        </button>
                      )}
                      {test.status === 'processing' && (
                        <button
                          onClick={() => handleOpenResultsForm(test)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold rounded-lg text-[10px] border border-emerald-200/50"
                        >
                          Write Report
                        </button>
                      )}
                      {test.status === 'completed' && (
                        <button
                          onClick={() => setSelectedTest(test)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg text-[10px] border border-slate-200"
                        >
                          View Report
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel and remove this diagnostic order?`)) {
                            deleteTest(test.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - View Report */}
      {selectedTest && !isUpdatingResults && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Diagnostic Report Completed
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">{selectedTest.testName}</h3>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block font-bold">PATIENT NAME</span>
                  <span className="text-slate-800 font-bold">{selectedTest.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">REFERRED BY</span>
                  <span className="text-slate-800 font-semibold">{selectedTest.referredBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">CATEGORY</span>
                  <span className="text-slate-800 font-semibold">{selectedTest.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">DATE COMPLETED</span>
                  <span className="text-slate-800 font-semibold font-mono">{selectedTest.testDate}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block font-bold">CLINICAL FINDINGS & RESULTS</span>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 mt-1 italic font-medium text-slate-700 leading-relaxed">
                  {selectedTest.reportResults || 'No findings recorded.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedTest(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Report View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Write / Edit Report findings */}
      {isUpdatingResults && selectedTest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveResults}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4"
          >
            <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-2">
              Generate Diagnostic Findings Report
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                <span className="text-[10px] text-slate-400 font-bold block">PATIENT & TEST DETAILS</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedTest.patientName}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{selectedTest.testName} · Category: {selectedTest.category}</span>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Clinical Findings Report</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Hemoglobin level normal. Urine culture shows zero bacterial colony growth after 24 hours of incubation."
                  value={reportResults}
                  onChange={(e) => setReportResults(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-medium font-sans leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsUpdatingResults(false);
                  setSelectedTest(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
              >
                Finalize Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Order New Test */}
      {isOrdering && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleOrderTest}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative space-y-4"
          >
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-2">
              Order New Diagnostic Pathology Test
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Patient ID / S/N</label>
                  <input
                    type="text"
                    required
                    placeholder="pat-101"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karim Ahmed"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Select Specialty Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pathology Test Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Referring Physician</label>
                  <select
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-700"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Standard Test Fee (BDT)</label>
                  <input
                    type="number"
                    required
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOrdering(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs"
              >
                Order Test
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
