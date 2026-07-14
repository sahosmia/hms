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
      alert('Please select an active admitted patient.');
      return;
    }
    if (!medicineName || !dosage || !nurseName) {
      alert('Please fill in medicine, dosage, and nurse name.');
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
    alert('Medication log and vital signs recorded successfully!');
  };

  const filteredLogs = medicationLogs.filter(log =>
    log.patientName.toLowerCase().includes(search.toLowerCase()) ||
    log.medicineName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans space-y-6">

      <div>
        <h2 className="text-2xl font-black text-slate-800">Nurse Medication Management Feed</h2>
        <p className="text-xs text-slate-500 mt-0.5">Record patient medication details, schedule logs, and track real-time vital signs (BP, Temp, SpO2)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Plus className="w-5 h-5 text-primary" />
            New Medication & Vitals Entry
          </h3>

          <form onSubmit={handleSubmitLog} className="space-y-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Select Admitted Patient</label>
              <select
                value={selectedAdmissionId}
                onChange={(e) => setSelectedAdmissionId(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">Choose Patient...</option>
                {activeAdmissions.map(adm => (
                  <option key={adm.id} value={adm.id}>
                    {adm.patientName} ({adm.bedName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Medicine Name"
                placeholder="e.g., Napa Extend"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
              />
              <Input
                label="Dosage"
                placeholder="e.g., 1+0+1"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <Input
              label="On-duty Nurse Name"
              placeholder="e.g., Nurse Rahman"
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
            />

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 font-sans">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Live Vital Signs
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Blood Pressure (BP)"
                  placeholder="120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                />
                <Input
                  label="Pulse Rate (BPM)"
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                />
                <Input
                  label="Temperature (°F)"
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                />
                <Input
                  label="Oxygen (SpO2 %)"
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
              Log Vitals & Medication
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col h-[600px] font-sans">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Clipboard className="w-5 h-5 text-primary" />
              Live Nursing Care & Medication History
            </h3>

            <input
              type="text"
              placeholder="Search by patient or medicine name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary sm:w-48"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No active medication log records found.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-all font-sans">

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">{log.patientName}</span>
                      <Badge status="blue">
                        {admissions.find(a => a.id === log.admissionId)?.bedName || 'Cabin'}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600">
                      Medicine: <b className="text-primary">{log.medicineName}</b> | Dosage: <b className="text-slate-800 font-sans">{log.dosage}</b>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                      <span>Assigned Nurse: {log.nurseName}</span>
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
