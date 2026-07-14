import React, { useState } from 'react';
import { useOTInventory } from '../../context/OTInventoryContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useFinance } from '../../context/FinanceContext';
import { Badge, KanbanColumn } from '../../components/DataDisplays';
import { Plus, BarChart4, AlertTriangle, Layers } from 'lucide-react';

export const SurgeryScheduler: React.FC = () => {
  const { surgeries, inventory, supplyRequests, scheduleSurgery, updateSurgeryStatus, createSupplyRequest, updateSupplyRequestStatus } = useOTInventory();
  const { doctors } = useAppointments();
  const { addServiceDebitItem, monthlyTrends } = useFinance();

  const [activeTab, setActiveTab] = useState<'ot-board' | 'inventory' | 'finance'>('ot-board');

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [otRoom, setOtRoom] = useState('OT Room 1');
  const [procedureName, setProcedureName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [surgeonFee, setSurgeonFee] = useState(15000);
  const [roomCharge, setRoomCharge] = useState(5000);

  const [pickedConsumables, setPickedConsumables] = useState<{ itemId: string; quantity: number }[]>([]);

  const [isSupplyRequestOpen, setIsSupplyRequestOpen] = useState(false);
  const [requestItemId, setRequestItemId] = useState('');
  const [requestQty, setRequestQty] = useState(10);
  const [requestedBy, setRequestedBy] = useState('Nurse Rahman');

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !patientName || !selectedDocId || !procedureName || !surgeryDate) {
      alert('সকল তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    const doc = doctors.find(d => d.id === selectedDocId);
    if (!doc) return;

    const res = scheduleSurgery({
      patientId,
      patientName,
      doctorId: selectedDocId,
      doctorName: doc.name,
      otRoom,
      procedure: procedureName,
      date: surgeryDate,
      surgeonFee: Number(surgeonFee),
      roomCharge: Number(roomCharge),
      consumables: pickedConsumables
    });

    if (res.success && res.surgery) {
      addServiceDebitItem(patientId, {
        description: `Surgical Procedure: ${procedureName} (Surgeon Fee)`,
        amount: Number(surgeonFee),
        type: 'Surgical Fee'
      });
      addServiceDebitItem(patientId, {
        description: `Operation Theater Room Charge: ${otRoom}`,
        amount: Number(roomCharge),
        type: 'Surgical Fee'
      });

      res.surgery.consumables.forEach(cons => {
        addServiceDebitItem(patientId, {
          description: `Consumable: ${cons.itemName} (Qty: ${cons.quantity})`,
          amount: cons.unitPrice * cons.quantity,
          type: 'Supply Consumable'
        });
      });

      alert('সার্জারি সিডিউল নিশ্চিত করা হয়েছে এবং অপারেশন কস্টস রোগীর বিলিংয়ে পোস্টিং করা হয়েছে!');
      setIsSchedulerOpen(false);

      setPatientId('');
      setPatientName('');
      setSelectedDocId('');
      setProcedureName('');
      setSurgeryDate('');
      setPickedConsumables([]);
    } else {
      alert(res.message);
    }
  };

  const addConsumablePick = (itemId: string, qty: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (item.stock < qty) {
      alert(`দুঃখিত, স্টক সংকট। বর্তমানে '${item.name}' এর স্টক আছে মাত্র ${item.stock} টি।`);
      return;
    }

    setPickedConsumables(prev => {
      const existingIdx = prev.findIndex(p => p.itemId === itemId);
      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        return copy;
      }
      return [...prev, { itemId, quantity: qty }];
    });
  };

  const handleSupplyRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestItemId || !requestQty) return;

    createSupplyRequest(requestItemId, Number(requestQty), requestedBy);
    alert('নতুন সাপ্লাই রিকুয়েস্ট সফলভাবে সাবমিট করা হয়েছে!');
    setIsSupplyRequestOpen(false);
  };

  const scheduledSurgeries = surgeries.filter(s => s.status === 'scheduled');
  const inProgressSurgeries = surgeries.filter(s => s.status === 'in-progress');
  const completedSurgeries = surgeries.filter(s => s.status === 'completed');
  const cancelledSurgeries = surgeries.filter(s => s.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto p-6 font-bengali space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">ওটি ক্যানবান এবং ইনভেন্টরি লেজার (Operation Theater Hub)</h2>
          <p className="text-xs text-slate-500 mt-0.5">সার্জারি বুকিং উইজার্ড, ওটি ক্যানবান ড্র্যাগ এন্ড ড্রপ এবং সাপ্লাই স্টক অটো-ডিডাকশন লেজার</p>
        </div>

        <div className="flex bg-white rounded-xl p-1 border border-slate-200/60 shadow-xs shrink-0 self-start">
          <button
            onClick={() => setActiveTab('ot-board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ot-board' ? 'bg-primary text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ওটি ক্যানবান বোর্ড
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-primary text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            স্টক ও ইনভেন্টরি লেজার
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'finance' ? 'bg-primary text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ফাইন্যান্সিয়াল প্রফিট গ্রাফ
          </button>
        </div>
      </div>

      {activeTab === 'ot-board' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-600">সার্জারি তালিকা ট্র্যাকার (OT Live Kanban)</span>

            <button
              onClick={() => setIsSchedulerOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              সার্জারি সিডিউল করুন (Schedule Surgery)
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">

            <KanbanColumn title="নির্ধারিত সার্জারি (Scheduled)" badgeCount={scheduledSurgeries.length} badgeColor="blue">
              {scheduledSurgeries.map(surg => (
                <div key={surg.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 font-sans">
                  <div className="flex justify-between items-start font-bengali">
                    <span className="text-[9px] font-bold text-slate-400">OT: {surg.otRoom}</span>
                    <Badge status="blue">সিডিউল্ড</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-bengali">{surg.procedure}</h4>
                  <div className="text-[10px] text-slate-500 font-bengali">
                    <div>পেশেন্ট: <b>{surg.patientName}</b></div>
                    <div>সার্জন: <b>{surg.doctorName}</b></div>
                    <div>তারিখ: <b className="font-sans">{surg.date}</b></div>
                  </div>
                  <div className="border-t border-slate-50 pt-2 flex justify-end gap-1 font-bengali">
                    <button
                      onClick={() => updateSurgeryStatus(surg.id, 'in-progress')}
                      className="px-2 py-0.5 text-[9px] bg-amber-50 text-amber-700 font-bold rounded hover:bg-amber-100"
                    >
                      সার্জারি শুরু করুন
                    </button>
                  </div>
                </div>
              ))}
            </KanbanColumn>

            <KanbanColumn title="চলমান অপারেশন (In-Progress)" badgeCount={inProgressSurgeries.length} badgeColor="yellow">
              {inProgressSurgeries.map(surg => (
                <div key={surg.id} className="bg-white border border-amber-200 rounded-xl p-3 shadow-xs space-y-2 animate-pulse font-sans">
                  <div className="flex justify-between items-start font-bengali">
                    <span className="text-[9px] font-bold text-slate-400">OT: {surg.otRoom}</span>
                    <Badge status="yellow">চলমান</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-bengali">{surg.procedure}</h4>
                  <div className="text-[10px] text-slate-500 font-bengali">
                    <div>পেশেন্ট: <b>{surg.patientName}</b></div>
                    <div>সার্জন: <b>{surg.doctorName}</b></div>
                  </div>
                  <div className="border-t border-slate-50 pt-2 flex justify-end gap-1 font-bengali">
                    <button
                      onClick={() => updateSurgeryStatus(surg.id, 'completed')}
                      className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-700 font-bold rounded hover:bg-emerald-100"
                    >
                      সম্পন্ন করুন
                    </button>
                  </div>
                </div>
              ))}
            </KanbanColumn>

            <KanbanColumn title="সম্পন্ন হয়েছে (Completed)" badgeCount={completedSurgeries.length} badgeColor="green">
              {completedSurgeries.map(surg => (
                <div key={surg.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2 opacity-85 font-sans">
                  <div className="flex justify-between items-start font-bengali">
                    <span className="text-[9px] font-bold text-slate-400">OT: {surg.otRoom}</span>
                    <Badge status="green">সম্পন্ন</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-bengali">{surg.procedure}</h4>
                  <p className="text-[10px] text-slate-500 font-bengali">
                    পেশেন্ট: <b>{surg.patientName}</b> | সার্জন: <b>{surg.doctorName}</b>
                  </p>
                </div>
              ))}
            </KanbanColumn>

            <KanbanColumn title="বাতিলকৃত (Cancelled)" badgeCount={cancelledSurgeries.length} badgeColor="gray">
              {cancelledSurgeries.map(surg => (
                <div key={surg.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-2 opacity-65 font-sans">
                  <span className="text-[9px] font-bold text-slate-400">OT: {surg.otRoom}</span>
                  <h4 className="text-xs font-bold text-slate-400 line-through font-bengali">{surg.procedure}</h4>
                </div>
              ))}
            </KanbanColumn>

          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-primary" />
                মেডিকেল কন্সুম্যাবল ও ড্রাগ ইনভেন্টরি লেজার
              </h3>

              <button
                onClick={() => setIsSupplyRequestOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                + স্টক রিকুয়েস্ট করুন
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-bold">
                    <th className="px-4 py-2.5">সরবরাহের নাম</th>
                    <th className="px-4 py-2.5">ক্যাটাগরি</th>
                    <th className="px-4 py-2.5 text-center">স্টক পরিমাণ</th>
                    <th className="px-4 py-2.5 text-right">ইউনিট মূল্য</th>
                    <th className="px-4 py-2.5 text-center">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                  {inventory.map(item => {
                    const isLow = item.stock < item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 text-center font-bold font-sans">{item.stock} টি</td>
                        <td className="px-4 py-3 text-right font-sans">৳ {item.unitPrice}</td>
                        <td className="px-4 py-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                              স্টক সংকট (Low Stock)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              পর্যাপ্ত স্টক
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
              স্টক রিকুয়েস্ট লগ (Stock Requests Log)
            </h3>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {supplyRequests.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">কোনো রিকুয়েস্ট পাঠানো হয়নি।</p>
              ) : (
                supplyRequests.map(req => (
                  <div key={req.id} className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs space-y-1.5 hover:border-slate-200 transition-all font-sans">
                    <div className="flex justify-between items-start font-bengali">
                      <span className="font-bold text-slate-800">{req.itemName}</span>
                      <Badge status={req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : 'yellow'}>
                        {req.status === 'approved' ? 'অনুমোদিত' : req.status === 'rejected' ? 'প্রত্যাখ্যাত' : 'পেন্ডিং'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 font-bengali">
                      <div>পরিমাণ: <b className="font-sans">{req.quantity} টি</b></div>
                      <div>অনুরোধকারী: <b>{req.requestedBy}</b></div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-1 pt-1 border-t border-slate-100 font-bengali">
                        <button
                          onClick={() => updateSupplyRequestStatus(req.id, 'rejected')}
                          className="px-2 py-0.5 bg-rose-50 text-rose-600 font-bold rounded text-[10px]"
                        >
                          প্রত্যাখ্যান
                        </button>
                        <button
                          onClick={() => updateSupplyRequestStatus(req.id, 'approved')}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded text-[10px]"
                        >
                          অনুমোদন
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'finance' && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart4 className="w-5 h-5 text-primary" />
                বিভাগীয় আর্থিক লাভালাভ গ্রাফ ও প্রবণতা (Segmented Financial Profit Trends)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">মাসিক মোট রাজস্ব, ব্যয় এবং নেট লাভ ট্রেন্ডসমূহ</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-600 mb-4">রাজস্ব বনাম ব্যয় তুলনামূলক বিশ্লেষণ (Revenue vs Expenses)</h4>

                <div className="h-[200px] flex items-end gap-3 sm:gap-5 pt-4 px-2">
                  {monthlyTrends.map((t, idx) => {
                    const maxVal = Math.max(...monthlyTrends.map(m=>Math.max(m.revenue, m.expenses)));
                    const revHeight = maxVal ? (t.revenue / maxVal) * 100 : 0;
                    const expHeight = maxVal ? (t.expenses / maxVal) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-1 h-[140px] items-end justify-center">
                          <div
                            style={{ height: `${revHeight}%` }}
                            className="w-3 bg-blue-500 rounded-t-sm"
                            title={`Revenue: ৳${t.revenue}`}
                          />
                          <div
                            style={{ height: `${expHeight}%` }}
                            className="w-3 bg-rose-400 rounded-t-sm"
                            title={`Expense: ৳${t.expenses}`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-sans mt-1.5">{t.month}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 justify-center items-center mt-4 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm" /> মোট রাজস্ব (Revenue)</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-400 rounded-sm" /> হাসপাতালের ব্যয় (Expenses)</div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-600 mb-4 font-bengali">নিট লাভ ট্রেন্ড চিত্র (Net Hospital Profit Segmented Trends)</h4>

                <div className="space-y-4 pt-2">
                  {monthlyTrends.map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 font-semibold font-sans">
                        <span className="font-bengali">{t.month} - Net Profit</span>
                        <span className="text-emerald-600 font-bold">৳ {t.profit}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          style={{ width: `${Math.min(100, (t.profit / 300000) * 100)}%` }}
                          className="bg-emerald-500 h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {isSchedulerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-slideUp">

            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase">সার্জারি ও ওটি সিডিউলিং উইজার্ড</h3>
                <h4 className="text-base font-bold text-slate-800 mt-0.5">নতুন অপারেশন ও ডক্টর বুকিং করুন</h4>
              </div>
              <button
                onClick={() => setIsSchedulerOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 font-bengali">

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">পেশেন্ট আইডি (Patient ID)</label>
                  <input
                    type="text"
                    placeholder="যেমন: usr-pat-017"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">রোগীর নাম (Patient Name)</label>
                  <input
                    type="text"
                    placeholder="যেমন: আরিফ আহমেদ"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">সার্জন (Doctor) নির্বাচন</label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali"
                  >
                    <option value="">ডাক্তার নির্বাচন করুন...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">ওটি রুম (OT Room)</label>
                  <select
                    value={otRoom}
                    onChange={(e) => setOtRoom(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali"
                  >
                    <option value="OT Room 1">OT Room 1 (Main Surgery Block)</option>
                    <option value="OT Room 2">OT Room 2 (Emergency Block)</option>
                    <option value="ICU OT Room">ICU Support OT Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">অপারেশন তারিখ</label>
                  <input
                    type="date"
                    value={surgeryDate}
                    onChange={(e) => setSurgeryDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-sans bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">অপারেশন প্রসিডিউর নাম</label>
                  <input
                    type="text"
                    placeholder="যেমন: Appendectomy"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 font-bengali">সার্জন ফি (৳)</label>
                  <input
                    type="number"
                    value={surgeonFee}
                    onChange={(e) => setSurgeonFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 font-bengali">ওটি রুম চার্জ (৳)</label>
                  <input
                    type="number"
                    value={roomCharge}
                    onChange={(e) => setRoomCharge(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">সার্জারি সরবরাহের তালিকা (Surgical supplies Consumed)</span>
                <div className="flex gap-2">
                  <select
                    id="consumableSelect"
                    className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none font-bengali"
                  >
                    <option value="">সরঞ্জাম চয়ন করুন...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (স্টক: {i.stock} টি)</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('consumableSelect') as HTMLSelectElement;
                      if (sel && sel.value) {
                        addConsumablePick(sel.value, 1);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    যোগ করুন
                  </button>
                </div>

                {pickedConsumables.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-lg p-2.5 max-h-24 overflow-y-auto space-y-1 text-[11px] text-slate-600 font-sans">
                    {pickedConsumables.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="font-bengali">{inventory.find(i=>i.id===item.itemId)?.name}</span>
                        <span className="font-bold">{item.quantity} টি</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSchedulerOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  সিডিউল ও চার্জ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {isSupplyRequestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-100 animate-slideUp">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase">স্টক রি-অর্ডার রিকুয়েস্ট উইজার্ড</h3>
                <h4 className="text-sm font-bold text-slate-800 mt-0.5">নতুন রি-অর্ডার ফর্ম</h4>
              </div>
              <button
                onClick={() => setIsSupplyRequestOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSupplyRequestSubmit} className="space-y-4">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">সরঞ্জামের নাম নির্বাচন</label>
                <select
                  value={requestItemId}
                  onChange={(e) => setRequestItemId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none font-bengali"
                >
                  <option value="">সরঞ্জাম চয়ন করুন...</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 font-sans">
                <label className="text-xs font-semibold text-slate-700 font-bengali">অনুরোধকৃত পরিমাণ (Quantity)</label>
                <input
                  type="number"
                  value={requestQty}
                  onChange={(e) => setRequestQty(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 font-bengali">অনুরোধকারীর নাম</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-bengali bg-white"
                />
              </div>

              <div className="flex gap-2 font-bengali">
                <button
                  type="button"
                  onClick={() => setIsSupplyRequestOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  রিকুয়েস্ট পাঠান
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
