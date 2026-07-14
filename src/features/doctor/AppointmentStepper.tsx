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
    sublabel: `${d.specialty} | Fees: BDT ${d.fees}`
  }));

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!selectedDocId) {
        setError('Please select a doctor.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!bookingDate) {
        setError('Please select an appointment date.');
        return;
      }
      if (!selectedSlot) {
        setError('Please select a time slot.');
        return;
      }

      if (selectedDoctor) {
        const dateObj = new Date(bookingDate);
        const dayOfWeek = dateObj.getDay();
        if (!selectedDoctor.workingDays.includes(dayOfWeek)) {
          setError(`Selected doctor is not available on this day of the week.`);
          return;
        }
        if (selectedDoctor.holidays.includes(bookingDate)) {
          setError('Selected date is a holiday for this doctor.');
          return;
        }
      }

      setStep(3);
    }
  };

  const handleBookingSubmit = () => {
    setError('');
    if (!symptoms.trim()) {
      setError('Please provide details on symptoms or reason of visit.');
      return;
    }

    if (!user) {
      setError('You must be logged in to book an appointment.');
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
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-sans pb-20">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">Appointment Stepper Flow</h2>
        <p className="text-xs text-slate-500 mt-0.5">Book an appointment easily in 4 interactive steps</p>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-5 text-center">
        {[
          { num: 1, text: 'Doctor' },
          { num: 2, text: 'Date & Slot' },
          { num: 3, text: 'Symptoms' },
          { num: 4, text: 'Complete' }
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
            <div className="font-sans text-[10px] uppercase opacity-85">Step {s.num}</div>
            <div className="mt-0.5">{s.text}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-4">

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Step 1: Choose Doctor</h3>

            <SearchableDropdown
              label="Select Doctor"
              options={doctorOptions}
              value={selectedDocId}
              onChange={setSelectedDocId}
              placeholder="Search by physician name or department..."
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
                  <p className="text-[10px] text-slate-500 mt-0.5">Consultation Fee: BDT {selectedDoctor.fees}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleNextStep}
              className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Proceed to Next Step
            </button>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Step 2: Appointment Date & Slot</h3>

            <Input
              label="Select Booking Date"
              type="date"
              value={bookingDate}
              onChange={(e) => {
                setBookingDate(e.target.value);
                setError('');
              }}
              error={error}
            />

            <div className="bg-blue-50 text-blue-800 text-[10px] p-2.5 rounded-lg border border-blue-100 space-y-1">
              <span className="font-bold">Doctor Roster Information:</span>
              <p>1. Working Days: {selectedDoctor.workingDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</p>
              {selectedDoctor.holidays.length > 0 && (
                <p>2. Doctor Holidays: {selectedDoctor.holidays.join(', ')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Available Time Slots</label>
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
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Step 3: Symptoms Description</h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div><b>Physician:</b> {selectedDoctor.name}</div>
              <div><b>Date & Time:</b> {bookingDate} ({selectedSlot})</div>
              <div><b>Consultation Fee:</b> BDT {selectedDoctor.fees}</div>
            </div>

            <Textarea
              label="Describe Your Symptoms / Medical Reason"
              placeholder="Describe briefly (e.g., Fever for 3 days, dry cough, abdominal pain)..."
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
                Back
              </button>
              <button
                onClick={handleBookingSubmit}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}

        {step === 4 && success && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner font-sans font-bold text-lg">
              ✓
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800">Booking Confirmed Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">Your appointment details are provided below</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2 max-w-sm mx-auto font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-bold text-primary font-mono">{success.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-bold text-slate-700">{success.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor Name:</span>
                <span className="font-bold text-slate-700">{success.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-slate-700">{success.date} ({success.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fees Paid:</span>
                <span className="font-bold text-slate-700">BDT {selectedDoctor?.fees}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href="/patient/history"
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center"
              >
                Go to History List
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
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
