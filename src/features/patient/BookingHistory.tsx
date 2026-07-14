import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useFinance } from '../../context/FinanceContext';
import { Badge } from '../../components/DataDisplays';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const { bills, checkoutBill } = useFinance();
  const [activeTab, setActiveTab] = useState<'appointments' | 'billing'>('appointments');
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'billing') {
      setActiveTab('billing');
    }
  }, []);

  const userAppointments = appointments.filter(apt => apt.patientId === user?.id);
  const userBills = bills.filter(b => b.patientId === user?.id);

  const handlePayBill = (billId: string) => {
    checkoutBill(billId, 'Mobile Banking (bKash/Nagad)');
    setPayingBillId(null);
    alert('Bill payment was successful!');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-sans pb-20">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">History & Payments</h2>
        <p className="text-xs text-slate-500 mt-0.5">List of all your active bookings and pending financial invoices</p>
      </div>

      <div className="flex bg-white rounded-xl p-1 border border-slate-200/60 shadow-sm mb-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'appointments' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Appointments ({userAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'billing' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Invoices & Bills ({userBills.length})
        </button>
      </div>

      {activeTab === 'appointments' ? (
        <div className="space-y-3">
          {userAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              No booking records found.
            </div>
          ) : (
            userAppointments.map(apt => (
              <div key={apt.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary bg-blue-50 px-2 py-0.5 rounded-md">
                      {apt.serialNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 mt-2">{apt.doctorName}</h3>
                  </div>
                  <Badge status={apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}>
                    {apt.status === 'confirmed' ? 'Confirmed' : apt.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Specialty: {apt.specialty}</span>
                  <span>Time Slot: <b>{apt.timeSlot}</b></span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-100/80 leading-relaxed">
                  <b>Symptoms:</b> {apt.symptoms}
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 border-t border-slate-50 font-sans">
                  <span>Date: <b>{apt.date}</b></span>
                  <span>Fees Status: <b>{apt.feesPaid ? 'Paid' : 'Payable at Counter'}</b></span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {userBills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              No invoices generated.
            </div>
          ) : (
            userBills.map(bill => (
              <div key={bill.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      INV-{bill.id.toUpperCase()}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 mt-2">Discharge & Medical Care Bill</h3>
                  </div>
                  <Badge status={bill.status === 'Paid' ? 'green' : 'red'}>
                    {bill.status === 'Paid' ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100 text-[11px]">
                  {bill.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 text-slate-600 font-sans">
                      <span>{item.description} <b className="text-[9px] text-slate-400">({item.type})</b></span>
                      <span className="font-semibold text-slate-700">BDT {item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold text-slate-800 text-xs font-sans">
                    <span>Total Amount Payable:</span>
                    <span className="text-primary">BDT {bill.totalAmount}</span>
                  </div>
                </div>

                {bill.status === 'Unpaid' ? (
                  <button
                    onClick={() => setPayingBillId(bill.id)}
                    className="w-full py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Bill Online
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 text-xs font-bold flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Paid via: {bill.paymentMethod}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {payingBillId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 animate-slideUp">
            <h3 className="text-sm font-bold text-slate-800">Secure Online Payment Gateway</h3>
            <p className="text-xs text-slate-500">Complete mock transaction using your mobile banking wallet credentials.</p>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-sans">
              <div><b>Amount:</b> BDT {bills.find(b=>b.id === payingBillId)?.totalAmount}</div>
              <div><b>Gateway Fees:</b> BDT 0 (Free)</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPayingBillId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayBill(payingBillId)}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
