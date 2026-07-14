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
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col font-sans pb-20">

      <div className="bg-primary text-white p-6 rounded-b-3xl shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg text-white ring-2 ring-white/30 shadow-inner">
            {user?.name?.[0] || 'P'}
          </div>
          <div>
            <h2 className="text-base font-bold truncate max-w-[200px]">{user?.name}</h2>
            <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              Patient Portal (Active)
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
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-blue-50 text-primary border border-blue-200' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Medical Profile
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="p-4 space-y-5">

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              <a href="/patient/booking" className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-sm hover:scale-102 transition-all">
                <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Book Appointment</span>
              </a>
              <a href="/patient/history" className="bg-white hover:bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-sm hover:scale-102 transition-all">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Booking History</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Case Status</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Visits</span>
                <span className="text-sm font-bold text-slate-800 mt-1">{userAppointments.length} Time(s)</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">Indoor Bed</span>
                {activeAdmission ? (
                  <Badge status="red">Admitted</Badge>
                ) : (
                  <Badge status="gray">Not Admitted</Badge>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center flex flex-col items-center justify-center border border-slate-100">
                <span className="text-xs text-slate-500 block">Unpaid Bill</span>
                <span className="text-xs font-bold text-rose-600 mt-1">BDT {unpaidTotal}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Alerts & Notifications</h3>
            {activeAdmission ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 shadow-sm flex gap-3 items-start animate-pulse">
                <Activity className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Indoor Admission Alert!</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    You are currently admitted to <b>{activeAdmission.name}</b>. Nurses are periodically recording your vitals and medication details.
                  </p>
                </div>
              </div>
            ) : null}

            {userAppointments.length > 0 && userAppointments[0].status === 'pending' ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Appointment Pending!</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Your appointment request with {userAppointments[0].doctorName} for ({userAppointments[0].date}) is awaiting staff approval.
                  </p>
                </div>
              </div>
            ) : null}

            {unpaidTotal > 0 ? (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold">Invoice Payment Reminder</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    You have an outstanding bill of BDT {unpaidTotal}. Please complete payment online for a hassle-free discharge process.
                  </p>
                  <a href={`/patient/history?tab=billing`} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-2 hover:underline">
                    Pay Now <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 shadow-sm flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">No Outstanding Bills</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">All of your financial invoices are cleared. Wishing you robust health!</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming Doctor Visits</h3>
            {userAppointments.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-100">
                {userAppointments.slice(0, 2).map((apt, index) => (
                  <div key={apt.id} className={`pt-2 ${index === 0 ? 'pt-0' : ''}`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="text-xs font-bold text-slate-800">{apt.doctorName}</h4>
                      <Badge status={apt.status === 'confirmed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}>
                        {apt.status === 'confirmed' ? 'Confirmed' : apt.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Specialty: {apt.specialty}</span>
                      <span>Serial: {apt.serialNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-sans">
                      <span>Date: <b>{apt.date}</b></span>
                      <span>Time: <b>{apt.timeSlot}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No active appointments found.</p>
            )}
          </div>

        </div>
      ) : (
        <div className="p-4 space-y-4">

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-bold text-primary">{profile?.bloodGroup || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-semibold text-slate-700 font-sans">{profile?.dateOfBirth}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-700">{profile?.gender === 'Male' ? 'Male' : 'Female'}</span>
              </div>
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="text-slate-500">National ID (NID)</span>
                <span className="font-mono text-slate-700">{profile?.nid}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Known Allergies</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile?.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((allergy, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-sm font-sans">
                    ⚠️ {allergy}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No allergies recorded</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical History & Diagnoses</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile?.medicalHistory && profile.medicalHistory.length > 0 ? (
                profile.medicalHistory.map((history, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-200 rounded-lg text-xs font-bold shadow-sm">
                    🩺 {history}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No medical records found</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</h3>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">{profile?.emergencyContactName}</div>
              <div className="text-xs text-slate-500 font-sans">Contact No: {profile?.emergencyContactPhone}</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
