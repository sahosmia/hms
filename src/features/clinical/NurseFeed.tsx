import React, { useState } from 'react';
import { useClinicalBeds } from '../../context/ClinicalBedProvider';
import { Badge } from '../../components/DataDisplays';
import { HeartPulse, Plus, Clipboard, Clock } from 'lucide-react';
import { Input } from '../../components/FormComponents';

export const NurseFeed: React.FC = () => {
  const { admissions, medicationLogs, addMedicationLog } = useClinicalBeds();
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [nurseName, setNurseName] = useState('');

  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [spo2, setSpo2] = useState(98);

  const [search, setSearch] = useState('');

  const activeAdmissions = admissions.filter(adm => adm.status === 'admitted');

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      alert('রোগী নির্বাচন করুন।');
      return;
    }
    if (!medicineName || !dosage || !nurseName) {
      alert('সব তথ্য সঠিকভাবে দিন।');
      return;
    }

    const adm = admissions.find(a => a.id === selectedAdmissionId);
    if (!adm) return;

    addMedicationLog({
      admissionId: selectedAdmissionId,
      patientId: adm.patientId,
      patientName: adm.patientName,
      medicineName,
      dosage,
      nurseName,
      vitals: { bp, pulse: Number(pulse), temp: Number(temp), spo2: Number(spo2) }
    });

    setMedicineName('');
    setDosage('');
    alert('মেডিকেশন লগ এবং ভাইটাল সাইন সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const filteredLogs = medicationLogs.filter(log =>
    log.patientName.toLowerCase().includes(search.toLowerCase()) ||
    log.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-bengali space-y-6">

      <div>
        <h2 className="text-2xl font-black text-slate-800 font-bengali">নার্সিং এন্ড কেয়ার ফিড (Nurse Medication Management Feed)</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-bengali">ভর্তি রোগীদের ঔষধের সময়সূচী ও নিয়মিত ভাইটাল সাইন (BP, Temp, SpO2) রেকর্ডার</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-bengali">

        <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Plus className="w-5 h-5 text-primary" />
            নতুন লগ এবং ভাইটাল এন্ট্রি
          </h3>

          <form onSubmit={handleSubmitLog} className="space-y-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">ভর্তি রোগী নির্বাচন করুন</label>
              <select
                value={selectedAdmissionId}
                onChange={(e) => setSelectedAdmissionId(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">রোগী বেছে নিন...</option>
                {activeAdmissions.map(adm => (
                  <option key={adm.id} value={adm.id}>
                    {adm.patientName} ({adm.bedName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ওষুধের নাম"
                placeholder="যেমন: Napa Extend"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
              />
              <Input
                label="ডোজ (Dosage)"
                placeholder="যেমন: 1+0+1"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <Input
              label="অন-ডিউটি নার্সের নাম"
              placeholder="যেমন: Nurse Rahman"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
            />

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 font-sans">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 font-bengali">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                লাইভ ভাইটাল সাইন
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="রক্তচাপ (BP)"
                  placeholder="120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                />
                <Input
                  label="পালস রেট (BPM)"
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                />
                <Input
                  label="তাপমাত্রা (°F)"
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                />
                <Input
                  label="অক্সিজেন (SpO2 %)"
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              রেকর্ড করুন (Log Vitals)
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col h-[600px] font-sans">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-4 font-bengali">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Clipboard className="w-5 h-5 text-primary" />
              লাইভ কেয়ার ও মেডিকেশন হিস্টোরি
            </h3>

            <input
              type="text"
              placeholder="রোগী বা ওষুধের নাম সার্চ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali sm:w-48 bg-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-bengali">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                কোনো মেডিকেশন লগ রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-all font-sans">

                  <div className="space-y-1.5 font-bengali">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{log.patientName}</span>
                      <Badge status="blue">
                        {admissions.find(a => a.id === log.admissionId)?.bedName || 'Cabin'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600">
                      ওষুধ: <b className="text-primary">{log.medicineName}</b> | ডোজ: <b className="text-slate-800 font-sans">{log.dosage}</b>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                      <span>নার্স: {log.nurseName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-white px-3 py-2 rounded-xl border border-slate-150/60 shrink-0 font-sans">
                    <div className="text-center px-1">
                      <span className="text-[9px] text-slate-400 block">BP</span>
                      <span className="text-xs font-bold text-slate-700">{log.vitals.bp}</span>
                    </div>
                    <div className="text-center px-1 border-l border-slate-100">
                      <span className="text-[9px] text-slate-400 block">HR (bpm)</span>
                      <span className={`text-xs font-bold ${log.vitals.pulse > 100 || log.vitals.pulse < 60 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {log.vitals.pulse}
                      </span>
                    </div>
                    <div className="text-center px-1 border-l border-slate-100">
                      <span className="text-[9px] text-slate-400 block">Temp</span>
                      <span className={`text-xs font-bold ${log.vitals.temp > 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {log.vitals.temp}°F
                      </span>
                    </div>
                    <div className="text-center px-1 border-l border-slate-100">
                      <span className="text-[9px] text-slate-400 block">SpO2</span>
                      <span className={`text-xs font-bold ${log.vitals.spo2 < 95 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {log.vitals.spo2}%
                      </span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
