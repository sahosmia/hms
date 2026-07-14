import React, { useState } from 'react';
import { useClinicalBeds } from '../../context/ClinicalBedProvider';
import { useFinance } from '../../context/FinanceContext';
import { Badge } from '../../components/DataDisplays';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import type { Bed } from '../../types';

export const BedDashboard: React.FC = () => {
  const { beds, admitPatient, updateBedStatus } = useClinicalBeds();
  const { createBillForAdmission } = useFinance();

  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const [category, setCategory] = useState<'All' | 'ICU' | 'Ward' | 'Cabin' | 'CCU'>('All');

  const filteredBeds = beds.filter(b => category === 'All' || b.type === category);

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBedId || !patientId || !patientName || !reason) {
      setError('সকল তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    const res = admitPatient(patientId, patientName, selectedBedId, reason);
    if (res.success && res.admission) {
      createBillForAdmission(patientId, patientName, res.admission.id);

      alert(`রোগী ভর্তিকরণ সম্পন্ন হয়েছে এবং '${res.admission.bedName}' বরাদ্দ করা হয়েছে!`);
      setSelectedBedId(null);
      setPatientId('');
      setPatientName('');
      setReason('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-bengali space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">রিয়েল-টাইম বেড ও ওয়ার্ড অকুপেন্সি (Live Bed Grid)</h2>
          <p className="text-xs text-slate-500 mt-0.5">ICU, সাধারণ ওয়ার্ড এবং কেবিনের বরাদ্দকরণ, পর্যবেক্ষণ ও রক্ষণাবেক্ষণ</p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {(['All', 'ICU', 'Ward', 'Cabin', 'CCU'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                category === cat
                  ? 'bg-primary text-white border-primary shadow-sm shadow-blue-150'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'সব ধরণের বেড' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed: Bed) => {
          const statusColors = {
            Available: 'border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/80',
            Occupied: 'border-rose-100 bg-rose-50/40 hover:bg-rose-50/80',
            Maintenance: 'border-amber-100 bg-amber-50/40 hover:bg-amber-50/80'
          };

          return (
            <div
              key={bed.id}
              className={`border-2 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between h-[180px] shadow-sm ${statusColors[bed.status]}`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-none">{bed.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 block">
                      {bed.type}
                    </span>
                  </div>
                  <Badge status={bed.status === 'Available' ? 'green' : bed.status === 'Occupied' ? 'red' : 'yellow'}>
                    {bed.status === 'Available' ? 'ফ্রি' : bed.status === 'Occupied' ? 'ভর্তি' : 'রক্ষণাবেক্ষণ'}
                  </Badge>
                </div>

                {bed.status === 'Occupied' ? (
                  <div className="mt-3.5 space-y-1">
                    <div className="text-xs font-bold text-slate-700 truncate">
                      👤 {bed.patientName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {bed.patientId}</div>
                  </div>
                ) : bed.status === 'Maintenance' ? (
                  <p className="text-xs text-amber-700 italic mt-4 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    বেডটি প্রস্তুত হচ্ছে...
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 mt-4 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    রোগী ভর্তির জন্য প্রস্তুত
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">৳ {bed.dailyCharge}/দিন</span>

                <div className="flex gap-1.5">
                  {bed.status === 'Available' && (
                    <button
                      onClick={() => setSelectedBedId(bed.id)}
                      className="px-2.5 py-1 text-[10px] bg-primary hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      ভর্তি করুন
                    </button>
                  )}
                  {bed.status === 'Occupied' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Available')}
                      className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold cursor-pointer transition-all"
                    >
                      রিলিজ দিন
                    </button>
                  )}
                  {bed.status === 'Available' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Maintenance')}
                      className="px-2 py-0.5 text-[9px] text-slate-400 hover:text-amber-600 cursor-pointer"
                    >
                      রক্ষণাবেক্ষণ
                    </button>
                  )}
                  {bed.status === 'Maintenance' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Available')}
                      className="px-2.5 py-1 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold cursor-pointer transition-all"
                    >
                      চালু করুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBedId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-100 animate-slideUp">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase">ইনডোর পেসেন্ট ভর্তি উইজার্ড</h3>
                <h4 className="text-base font-bold text-slate-800 mt-1">
                  বেড: <span className="text-primary">{beds.find(b => b.id === selectedBedId)?.name}</span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedBedId(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="space-y-4 font-bengali">

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">রোগীর আইডি (Patient ID)</label>
                  <input
                    type="text"
                    placeholder="যেমন: pat-123"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">রোগীর নাম (Full Name)</label>
                  <input
                    type="text"
                    placeholder="আরিফ আহমেদ"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">ভর্তির প্রধান কারণ / রোগ (Reason for admission)</label>
                <textarea
                  placeholder="রোগীর শারীরিক সমস্যা বা রোগের সংক্ষিপ্ত বর্ণনা..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                />
              </div>

              {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBedId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  ভর্তি কনফার্ম করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
