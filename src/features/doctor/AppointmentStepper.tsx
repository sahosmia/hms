import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { Input, SearchableDropdown, Textarea } from '../../components/FormComponents';

export const AppointmentStepper: React.FC = () => {
  const { user } = useAuth();
  const { doctors, createAppointment } = useAppointments();

  const urlParams = new URLSearchParams(window.location.search);
  const initialDocId = urlParams.get('doctorId') || '';

  const [step, setStep] = useState(1);
  const [selectedDocId, setSelectedDocId] = useState(initialDocId);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const selectedDoctor = doctors.find(d => d.id === selectedDocId);

  const doctorOptions = doctors.map(d => ({
    value: d.id,
    label: d.name,
    sublabel: `${d.specialty} | ফি: ৳${d.fees}`
  }));

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!selectedDocId) {
        setError('অনুগ্রহ করে একজন ডাক্তার নির্বাচন করুন।');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!bookingDate) {
        setError('অনুগ্রহ করে অ্যাপয়েন্টমেন্টের তারিখ নির্বাচন করুন।');
        return;
      }
      if (!selectedSlot) {
        setError('অনুগ্রহ করে পছন্দসই স্লট নির্বাচন করুন।');
        return;
      }

      if (selectedDoctor) {
        const dateObj = new Date(bookingDate);
        const dayOfWeek = dateObj.getDay();
        if (!selectedDoctor.workingDays.includes(dayOfWeek)) {
          setError(`নির্বাচনকৃত তারিখে এই ডাক্তার রোগী দেখেন না।`);
          return;
        }
        if (selectedDoctor.holidays.includes(bookingDate)) {
          setError('নির্বাচিত তারিখটি ডাক্তারের জন্য ছুটির দিন (Holiday)।');
          return;
        }
      }

      setStep(3);
    }
  };

  const handleBookingSubmit = () => {
    setError('');
    if (!symptoms.trim()) {
      setError('অনুগ্রহ করে আপনার প্রধান লক্ষণ বা সমস্যাটি সংক্ষেপে লিখুন।');
      return;
    }

    if (!user) {
      setError('বুকিং করার জন্য লগইন থাকা আবশ্যক।');
      return;
    }

    const res = createAppointment({
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDocId,
      date: bookingDate,
      timeSlot: selectedSlot,
      symptoms: symptoms
    });

    if (res.success && res.appointment) {
      setSuccess(res.appointment);
      setStep(4);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-bengali pb-20">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">অ্যাপয়েন্টমেন্ট বুকিং (Appointment Wizard)</h2>
        <p className="text-xs text-slate-500 mt-0.5">সহজ ৪টি ধাপে অ্যাপয়েন্টমেন্ট বুক করুন</p>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-5 text-center">
        {[
          { num: 1, text: 'ডাক্তার' },
          { num: 2, text: 'তারিখ ও স্লট' },
          { num: 3, text: 'লক্ষণ' },
          { num: 4, text: 'সম্পন্ন' }
        ].map((s) => (
          <div
            key={s.num}
            className={`py-2 rounded-xl border text-xs font-bold transition-all ${
              step === s.num
                ? 'bg-primary text-white border-primary shadow-sm shadow-blue-150 scale-102'
                : step > s.num
                ? 'bg-blue-50 text-primary border-blue-200'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <div className="font-sans text-[10px] uppercase opacity-85">ধাপ {s.num}</div>
            <div className="mt-0.5">{s.text}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-4">

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">ধাপ ১: ডাক্তার নির্বাচন করুন</h3>

            <SearchableDropdown
              label="ডাক্তার খুঁজুন"
              options={doctorOptions}
              value={selectedDocId}
              onChange={setSelectedDocId}
              placeholder="ডাক্তারের নাম বা বিভাগ সার্চ করুন..."
              error={error}
            />

            {selectedDoctor && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-3 items-center">
                <img
                  src={selectedDoctor.imageUrl}
                  alt={selectedDoctor.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{selectedDoctor.name}</h4>
                  <p className="text-[10px] text-primary font-bold mt-0.5">{selectedDoctor.specialty}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">পরামর্শ ফি: ৳ {selectedDoctor.fees}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleNextStep}
              className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              পরবর্তী ধাপে যান
            </button>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">ধাপ ২: তারিখ ও স্লট নির্ধারণ</h3>

            <Input
              label="অ্যাপয়েন্টমেন্টের তারিখ"
              type="date"
              value={bookingDate}
              onChange={(e) => {
                setBookingDate(e.target.value);
                setError('');
              }}
              error={error}
            />

            <div className="bg-blue-50 text-blue-800 text-[10px] p-2.5 rounded-lg border border-blue-100 space-y-1">
              <span className="font-bold">ডাক্তার শিডিউল তথ্য:</span>
              <p>১. সচল সাপ্তাহিক কার্যদিবস: {selectedDoctor.workingDays.map(d => ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'][d]).join(', ')}</p>
              {selectedDoctor.holidays.length > 0 && (
                <p>২. ছুটির দিনসমূহ (Holidays): {selectedDoctor.holidays.join(', ')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">উপলব্ধ সময় স্লট (Available Slots)</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedDoctor.availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg text-xs font-semibold text-center border transition-all cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">ধাপ ৩: লক্ষণ ও সমস্যা বিবরণ</h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div><b>ডাক্তার:</b> {selectedDoctor.name}</div>
              <div><b>তারিখ:</b> {bookingDate} ({selectedSlot})</div>
              <div><b>পরামর্শ ফি:</b> ৳ {selectedDoctor.fees}</div>
            </div>

            <Textarea
              label="আপনার শারীরিক সমস্যা / লক্ষণসমূহ"
              placeholder="সংক্ষেপে লক্ষণগুলো লিখুন (যেমন: ৩ দিন ধরে জ্বর, বুকব্যথা ইত্যাদি)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              error={error}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                পূর্ববর্তী
              </button>
              <button
                onClick={handleBookingSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                বুকিং সম্পন্ন করুন
              </button>
            </div>
          </div>
        )}

        {step === 4 && success && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              ✓
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">বুকিং সফলভাবে সম্পন্ন হয়েছে!</h3>
              <p className="text-xs text-slate-500 mt-1">আপনার সিরিয়াল ও বিবরণ নিচে তুলে ধরা হলো</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2 max-w-sm mx-auto font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">সিরিয়াল নম্বর:</span>
                <span className="font-bold text-primary font-mono">{success.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bengali">রোগীর নাম:</span>
                <span className="font-bold text-slate-700 font-bengali">{success.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bengali">ডাক্তার:</span>
                <span className="font-bold text-slate-700 font-bengali">{success.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bengali">তারিখ ও সময়:</span>
                <span className="font-bold text-slate-700 font-bengali">{success.date} ({success.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bengali">ফি (পরামর্শ):</span>
                <span className="font-bold text-slate-700 font-bengali">৳ {selectedDoctor?.fees}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="/patient/history"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center"
              >
                বুকিং তালিকা দেখুন
              </a>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedDocId('');
                  setBookingDate('');
                  setSelectedSlot('');
                  setSymptoms('');
                  setSuccess(null);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                নতুন বুকিং করুন
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
