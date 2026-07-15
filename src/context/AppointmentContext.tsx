import { createContext, useContext, useState, useEffect } from 'react';
import type { Doctor, Appointment, DoctorReview } from '../types';

interface AppointmentContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  createAppointment: (data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
  }) => { success: boolean; appointment?: Appointment; message: string };
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addDoctorReview: (doctorId: string, review: Omit<DoctorReview, 'id' | 'createdAt'>) => void;
  addDoctor: (docData: Omit<Doctor, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => void;
  updateDoctorDetails: (id: string, docData: Partial<Omit<Doctor, 'id'>>) => void;
  deleteDoctor: (id: string) => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const initialDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ashraful Islam',
    specialty: 'Cardiology Specialist',
    experience: 15,
    rating: 4.8,
    reviewCount: 42,
    fees: 1000,
    workingDays: [1, 2, 3, 4],
    holidays: ['2026-07-21', '2026-07-28'],
    availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    reviews: [
      {
        id: 'rev-1',
        patientName: 'Karim Sheikh',
        rating: 5,
        comment: 'Very attentive doctor. Prescribed highly effective medications and explained everything carefully.',
        anonymous: false,
        createdAt: '2026-07-01'
      }
    ]
  },
  {
    id: 'doc-2',
    name: 'Dr. Fatema Zohra',
    specialty: 'Gynecology & Obstetrics',
    experience: 12,
    rating: 4.9,
    reviewCount: 56,
    fees: 800,
    workingDays: [0, 2, 4],
    holidays: ['2026-07-25'],
    availableSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '06:00 PM', '07:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200',
    reviews: [
      {
        id: 'rev-2',
        patientName: 'Taniya Sultana',
        rating: 5,
        comment: 'Wonderful behavior and highly competent surgeon. Strongly recommended.',
        anonymous: true,
        createdAt: '2026-07-05'
      }
    ]
  },
  {
    id: 'doc-3',
    name: 'Dr. Sajjad Hossain',
    specialty: 'Pediatrics Specialist',
    experience: 8,
    rating: 4.6,
    reviewCount: 29,
    fees: 600,
    workingDays: [1, 3, 5],
    holidays: [],
    availableSlots: ['09:00 AM', '11:00 AM', '03:00 PM', '04:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    reviews: []
  },
  {
    id: 'doc-4',
    name: 'Dr. Mostafizur Rahman',
    specialty: 'General Medicine Specialist',
    experience: 18,
    rating: 4.7,
    reviewCount: 65,
    fees: 700,
    workingDays: [0, 1, 2, 3, 4],
    holidays: [],
    availableSlots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '05:00 PM', '06:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    reviews: []
  },
  {
    id: 'doc-5',
    name: 'Dr. Sabrina Khan',
    specialty: 'Neurology Specialist',
    experience: 14,
    rating: 4.9,
    reviewCount: 38,
    fees: 1200,
    workingDays: [1, 2, 4],
    holidays: [],
    availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    reviews: []
  },
  {
    id: 'doc-6',
    name: 'Dr. Tanvir Rahman',
    specialty: 'Orthopedics & Joint Surgeon',
    experience: 16,
    rating: 4.8,
    reviewCount: 47,
    fees: 1100,
    workingDays: [0, 1, 3],
    holidays: [],
    availableSlots: ['09:00 AM', '10:30 AM', '03:00 PM', '05:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1612230337141-903f30a5c785?auto=format&fit=crop&q=80&w=200',
    reviews: []
  },
  {
    id: 'doc-7',
    name: 'Dr. Nusrat Jahan',
    specialty: 'Dermatology & Cosmetology',
    experience: 10,
    rating: 4.7,
    reviewCount: 32,
    fees: 900,
    workingDays: [2, 3, 4],
    holidays: [],
    availableSlots: ['11:00 AM', '12:00 PM', '04:00 PM', '06:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=200',
    reviews: []
  },
  {
    id: 'doc-8',
    name: 'Dr. Ariful islam',
    specialty: 'Nephrology & Kidney Specialist',
    experience: 15,
    rating: 4.6,
    reviewCount: 22,
    fees: 1000,
    workingDays: [1, 3, 5],
    holidays: [],
    availableSlots: ['09:00 AM', '10:00 AM', '03:30 PM', '04:30 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=200',
    reviews: []
  }
];

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const stored = localStorage.getItem('hms_doctors');
    if (stored) {
      const parsed = JSON.parse(stored) as Doctor[];
      // If some of our new preset doctors are missing from stored local state, reset/merge
      if (parsed.length < initialDoctors.length) {
        return initialDoctors;
      }
      return parsed;
    }
    return initialDoctors;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('hms_appointments');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('hms_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('hms_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const createAppointment = (data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    symptoms: string;
  }) => {
    const doctor = doctors.find(d => d.id === data.doctorId);
    if (!doctor) {
      return { success: false, message: 'Doctor not found.' };
    }

    const dateObj = new Date(data.date);
    const dayOfWeek = dateObj.getDay();

    if (!doctor.workingDays.includes(dayOfWeek)) {
      const daysStr = doctor.workingDays
        .map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d])
        .join(', ');
      return {
        success: false,
        message: `This doctor only visits on [${daysStr}]. Your selected date does not match the doctor's weekly schedule.`
      };
    }

    if (doctor.holidays.includes(data.date)) {
      return {
        success: false,
        message: `The selected date (${data.date}) is a public or personal holiday for this doctor. Please choose another date.`
      };
    }

    const alreadyBooked = appointments.some(
      apt => apt.doctorId === data.doctorId && apt.date === data.date && apt.timeSlot === data.timeSlot && apt.status !== 'cancelled'
    );
    if (alreadyBooked) {
      return {
        success: false,
        message: 'Sorry, this time slot has already been booked. Please select another slot.'
      };
    }

    const cleanedDate = data.date.replace(/-/g, '');
    const todaysApts = appointments.filter(apt => apt.date === data.date);
    const serialCount = (todaysApts.length + 1).toString().padStart(4, '0');
    const serialNumber = `APT-${cleanedDate}-${serialCount}`;

    const newAppointment: Appointment = {
      id: `apt-${Math.random().toString(36).substr(2, 9)}`,
      serialNumber,
      patientId: data.patientId,
      patientName: data.patientName,
      doctorId: data.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'pending',
      symptoms: data.symptoms,
      feesPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);

    return {
      success: true,
      appointment: newAppointment,
      message: 'Your appointment booking has been placed successfully!'
    };
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status, updatedAt: new Date().toISOString() } : apt))
    );
  };

  const addDoctorReview = (doctorId: string, reviewData: Omit<DoctorReview, 'id' | 'createdAt'>) => {
    const newReview: DoctorReview = {
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      ...reviewData,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDoctors(prev =>
      prev.map(doc => {
        if (doc.id === doctorId) {
          const updatedReviews = [newReview, ...doc.reviews];
          const averageRating = parseFloat(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          return {
            ...doc,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: averageRating
          };
        }
        return doc;
      })
    );
  };

  const addDoctor = (docData: Omit<Doctor, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
    const newDoc: Doctor = {
      ...docData,
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      rating: 5.0,
      reviewCount: 0,
      reviews: []
    };
    setDoctors(prev => [...prev, newDoc]);
  };

  const updateDoctorDetails = (id: string, updatedFields: Partial<Omit<Doctor, 'id'>>) => {
    setDoctors(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, ...updatedFields } : doc))
    );
  };

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <AppointmentContext.Provider value={{
      doctors,
      appointments,
      createAppointment,
      updateAppointmentStatus,
      addDoctorReview,
      addDoctor,
      updateDoctorDetails,
      deleteDoctor
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
