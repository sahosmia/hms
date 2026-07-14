import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useClinicalBeds } from '../../context/ClinicalBedProvider';
import { useFinance } from '../../context/FinanceContext';
import { Badge } from '../../components/DataDisplays';
import { Calendar, CreditCard, Activity, Bell, ChevronRight, ShieldCheck } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { appointments } = useAppointments();
  const { beds } = useClinicalBeds();
  const { bills } = useFinance();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');

  const userAppointments = appointments.filter(apt => apt.patientId === user?.id);
  const activeAdmission = beds.find(b => b.patientId === user?.id);
  const userBills = bills.filter(b => b.patientId === user?.id);

  const unpaidTotal = userBills
    .filter(b => b.status === 'Unpaid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-bengali pb-20">

      <div className="bg-primary text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white ring-2 ring-white/30 shadow-inner font-sans">
            {user?.name?.[0] || 'প'}
          </div>
          <div>
            <h2 className="text-base font-bold truncate max-w-[200px]">{user?.name}</h2>
            <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              পেশেন্ট পোর্টাল (Active)
            </p>
          </div>
        </div>
        <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </button>
      </div>

      <div className="flex gap-1 p-3 bg-white border-b border-slate-100 sticky top-[80px] z-20 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-blue-50 text-primary border border-blue-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ড্যাশবোর্ড ওভারভিউ
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-blue-50 text-primary border border-blue-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          মেডিকেল প্রোফাইল
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="p-4 space-y-5">

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">জরুরি নেভিগেশন</h3>
            <div className="grid grid-cols-2 gap-3">
              <a href="/patient/booking" className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-sm hover:scale-102 transition-all">
                <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">অ্যাপয়েন্টমেন্ট বুকিং</span>
              </a>
              <a href="/patient/history" className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-sm hover:scale-102 transition-all">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">বुकিং হিস্টোরি</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">লাইভ কেস স্ট্যাটাস</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">মোট ভিজিট</span>
                <span className="text-lg font-bold text-slate-800 mt-1">{userAppointments.length} বার</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">ইনডোর বেড</span>
                {activeAdmission ? (
                  <Badge status="red">ভর্তি আছেন</Badge>
                ) : (
                  <Badge status="gray">ভর্তি নেই</Badge>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">বকেয়া বিল</span>
                <span className="text-xs font-bold text-rose-600 mt-1">৳ {unpaidTotal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">লাইভ অ্যালার্ট ও নোটিফিকেশন</h3>
            {activeAdmission ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 shadow-sm flex gap-3 items-start animate-pulse">
                <Activity className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">ইনডোর এডমিশন এলার্ট!</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    আপনি বর্তমানে <b>{activeAdmission.name}</b> কেবিনে ভর্তি আছেন। নার্স নিয়মিত আপনার ভাইটাল ও ওষুধ রেকর্ড করছেন।
                  </p>
                </div>
              </div>
            ) : null}

            {userAppointments.length > 0 && userAppointments[0].status === 'pending' ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">অ্যাপয়েন্টমেন্ট পেন্ডিং!</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    {userAppointments[0].doctorName}-এর সাথে আপনার সিডিউল ({userAppointments[0].date}) এখনো পেন্ডিং রয়েছে।
                  </p>
                </div>
              </div>
            ) : null}

            {unpaidTotal > 0 ? (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold">ইনভয়েস পেমেন্ট রিমাইন্ডার</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    আপনার মোট ৳{unpaidTotal} বকেয়া রয়েছে। ঝামেলামুক্ত রিলিজের জন্য অনলাইন ডিসচার্জ কাউন্টার থেকে পরিশোধ করুন।
                  </p>
                  <a href={`/patient/history?tab=billing`} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-2 hover:underline">
                    বিল চেক করুন <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">কোনো বকেয়া বিল নেই</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">আপনার সকল বিল পরিশোধিত। আপনার সুস্বাস্থ্য কামনা করি।</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">আসন্ন ডাক্তার ভিজিট</h3>
            {userAppointments.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-100">
                {userAppointments.slice(0, 2).map((apt, index) => (
                  <div key={apt.id} className={`pt-2 ${index === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-xs font-bold text-slate-800">{apt.doctorName}</h4>
                      <Badge status={apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}>
                        {apt.status === 'confirmed' ? 'নিশ্চিত' : apt.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমান'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>স্পেশালিটি: {apt.specialty}</span>
                      <span>সিরিয়াল: {apt.serialNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-sans">
                      <span>তারিখ: <b>{apt.date}</b></span>
                      <span>সময়: <b>{apt.timeSlot}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">বর্তমানে কোনো শিডিউল বুকিং পাওয়া যায়নি।</p>
            )}
          </div>

        </div>
      ) : (
        <div className="p-4 space-y-4">

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">সাধারণ তথ্য (General Info)</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">রক্তের গ্রুপ (Blood)</span>
                <span className="font-bold text-primary">{profile?.bloodGroup || 'অজানা'}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">জন্ম তারিখ (DOB)</span>
                <span className="font-semibold text-slate-700 font-sans">{profile?.dateOfBirth}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">লিঙ্গ (Gender)</span>
                <span className="font-semibold text-slate-700">{profile?.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">জাতীয় পরিচয়পত্র (NID)</span>
                <span className="font-mono text-slate-700">{profile?.nid}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">এলার্জি সংক্রান্ত তথ্য (Allergies)</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile?.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((allergy, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-xs font-sans">
                    ⚠️ {allergy}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">কোনো অ্যালার্জি নেই</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">পূর্ববর্তী মেডিকেল রিপোর্ট ও ডায়াগনোসিস</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile?.medicalHistory && profile.medicalHistory.length > 0 ? (
                profile.medicalHistory.map((history, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 rounded-lg text-xs font-bold shadow-xs">
                    🩺 {history}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">কোনো মেডিকেল রেকর্ড পাওয়া যায়নি</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">জরুরি যোগাযোগ (Emergency Contact)</h3>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">{profile?.emergencyContactName}</div>
              <div className="text-xs text-slate-500 font-sans">যোগাযোগ: {profile?.emergencyContactPhone}</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
