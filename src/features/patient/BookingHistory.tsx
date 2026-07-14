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
    alert('বিল পরিশোধ সফল হয়েছে!');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-bengali pb-20">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">ইতিহাস ও পেমেন্ট (My Portal)</h2>
        <p className="text-xs text-slate-500 mt-0.5">আপনার সকল বুকিং এবং বকেয়া ইনভয়েসের তালিকা</p>
      </div>

      <div className="flex bg-white rounded-xl p-1 border border-slate-200/60 shadow-xs mb-4">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'appointments' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          অ্যাপয়েন্টমেন্ট বুকিংস ({userAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'billing' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ইনভয়েস ও বিলিং ({userBills.length})
        </button>
      </div>

      {activeTab === 'appointments' ? (
        <div className="space-y-3">
          {userAppointments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              কোনো বুকিং রেকর্ড পাওয়া যায়নি।
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
                    {apt.status === 'confirmed' ? 'নিশ্চিত' : apt.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমান'}
                  </Badge>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>বিভাগ: {apt.specialty}</span>
                  <span>সময়: <b>{apt.timeSlot}</b></span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 border border-slate-100/80 leading-relaxed">
                  <b>লক্ষণ:</b> {apt.symptoms}
                </div>

                <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 border-t border-slate-50 font-sans">
                  <span>তারিখ: <b>{apt.date}</b></span>
                  <span className="font-bengali">পরামর্শ ফি: <b>৳ {apt.feesPaid ? 'পরিশোধিত' : 'কাউন্টারে পরিশোধযোগ্য'}</b></span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {userBills.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
              কোনো ইনভয়েস জেনারেট করা হয়নি।
            </div>
          ) : (
            userBills.map(bill => (
              <div key={bill.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      INV-{bill.id.toUpperCase()}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 mt-2 font-bengali">ডিসচার্জ ও মেডিকেল কেয়ার বিল</h3>
                  </div>
                  <Badge status={bill.status === 'Paid' ? 'green' : 'red'}>
                    {bill.status === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'}
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100 text-[11px]">
                  {bill.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 text-slate-600 font-sans">
                      <span className="font-bengali">{item.description} <b className="text-[9px] text-slate-400">({item.type})</b></span>
                      <span className="font-semibold text-slate-700">৳ {item.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold text-slate-800 text-xs font-sans">
                    <span className="font-bengali">সর্বমোট পরিমাণ (Total Payable):</span>
                    <span className="text-primary">৳ {bill.totalAmount}</span>
                  </div>
                </div>

                {bill.status === 'Unpaid' ? (
                  <button
                    onClick={() => setPayingBillId(bill.id)}
                    className="w-full py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    মো바일 ব্যাংকিং পেমেন্ট করুন
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 text-xs font-bold flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>পরিশোধিত: {bill.paymentMethod}</span>
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
            <h3 className="text-sm font-bold text-slate-800">নিরাপদ অনলাইন পেমেন্ট গেটওয়ে (bKash/Nagad)</h3>
            <p className="text-xs text-slate-500">আপনার মোবাইল ব্যাংকিং অ্যাকাউন্ট থেকে পেমেন্ট সম্পূর্ণ করতে পিন কোড ও ওটিপি ভেরিফিকেশন সিমুলেশন সফল করুন।</p>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 font-sans">
              <div><b className="font-bengali">টাকার পরিমাণ:</b> ৳ {bills.find(b=>b.id === payingBillId)?.totalAmount}</div>
              <div><b className="font-bengali">গেটওয়ে চার্জ:</b> ৳ 0 (ফ্রি)</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPayingBillId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => handlePayBill(payingBillId)}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                পেমেন্ট নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
