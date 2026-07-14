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
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

const initialDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'ডাঃ আশরাফুল ইসলাম (Dr. Ashraful Islam)',
    specialty: 'Cardiology (হৃদরোগ বিশেষজ্ঞ)',
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
        patientName: 'করিম শেখ (Karim Sheikh)',
        rating: 5,
        comment: 'অনেক যত্ন সহকারে রোগী দেখেন এবং পরামর্শ দেন।',
        anonymous: false,
        createdAt: '2026-07-01'
      }
    ]
  },
  {
    id: 'doc-2',
    name: 'ডাঃ ফাতেমা জোহরা (Dr. Fatema Zohra)',
    specialty: 'Gynecology (স্ত্রীরোগ ও প্রসূতি বিশেষজ্ঞ)',
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
        patientName: 'তানিয়া সুলতানা (Taniya Sultana)',
        rating: 5,
        comment: 'ব্যবহার খুবই চমৎকার, ওষুধে দারুণ কাজ হয়েছে।',
        anonymous: true,
        createdAt: '2026-07-05'
      }
    ]
  },
  {
    id: 'doc-3',
    name: 'ডাঃ সাজ্জাদ হোসেন (Dr. Sajjad Hossain)',
    specialty: 'Pediatrics (শিশু বিশেষজ্ঞ)',
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
    name: 'ডাঃ মোস্তাফিজুর রহমান (Dr. Mostafizur Rahman)',
    specialty: 'General Medicine (মেডিসিন বিশেষজ্ঞ)',
    experience: 18,
    rating: 4.7,
    reviewCount: 65,
    fees: 700,
    workingDays: [0, 1, 2, 3, 4],
    holidays: [],
    availableSlots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '05:00 PM', '06:00 PM'],
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    reviews: []
  }
];

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const stored = localStorage.getItem('hms_doctors');
    return stored ? JSON.parse(stored) : initialDoctors;
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
        .map(d => ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][d])
        .join(', ');
      return {
        success: false,
        message: `এই ডাক্তার শুধুমাত্র [${daysStr}]-এ রোগী দেখেন। আপনার নির্বাচিত দিনটি ডাক্তারের শিডিউলের সাথে মিলছে না।`
      };
    }

    if (doctor.holidays.includes(data.date)) {
      return {
        success: false,
        message: `নির্বাচনকৃত তারিখ (${data.date}) ডাক্তারের জন্য ছুটির দিন (Holiday)। দয়া করে অন্য দিন বেছে নিন।`
      };
    }

    const alreadyBooked = appointments.some(
      apt => apt.doctorId === data.doctorId && apt.date === data.date && apt.timeSlot === data.timeSlot && apt.status !== 'cancelled'
    );
    if (alreadyBooked) {
      return {
        success: false,
        message: 'দুঃখিত, এই সময়ের স্লটটি ইতিমধ্যেই বুক হয়ে গিয়েছে। অনুগ্রহ করে অন্য স্লট নির্বাচন করুন।'
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
      message: 'আপনার অ্যাপয়েন্টমেন্ট বুকিং সফল হয়েছে!'
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

  return (
    <AppointmentContext.Provider value={{
      doctors,
      appointments,
      createAppointment,
      updateAppointmentStatus,
      addDoctorReview
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
