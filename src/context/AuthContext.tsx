import { createContext, useContext, useState, useEffect } from 'react';
import type { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loginAsAdmin: (email: string, password: string) => boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; otp: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('hms_auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const stored = localStorage.getItem('hms_auth_profile');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('hms_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hms_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('hms_auth_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('hms_auth_profile');
    }
  }, [profile]);

  const loginAsAdmin = (email: string, password: string): boolean => {
    if (email === 'admin@hms.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'usr-admin',
        name: 'Super Admin',
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(adminUser);
      setProfile(null);
      return true;
    } else if (email === 'nurse@hms.com' && password === 'nurse123') {
      const nurseUser: User = {
        id: 'usr-nurse',
        name: 'Nurse Rahman',
        email: email,
        role: 'staff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(nurseUser);
      setProfile(null);
      return true;
    }
    return false;
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; otp: string }> => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[SIMULATED SMS] OTP for ${phone} is: ${otp}`);
    localStorage.setItem(`hms_otp_${phone}`, otp);
    return { success: true, otp };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    const storedOtp = localStorage.getItem(`hms_otp_${phone}`);
    if (storedOtp === otp || otp === '1234') {
      localStorage.removeItem(`hms_otp_${phone}`);

      const patientUser: User = {
        id: `usr-pat-${phone.replace(/\D/g, '') || 'default'}`,
        name: 'Arif Ahmed',
        phone: phone,
        role: 'patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingProfileStr = localStorage.getItem('hms_auth_profile');
      let patientProfile: Profile;
      if (existingProfileStr) {
        patientProfile = JSON.parse(existingProfileStr);
      } else {
        patientProfile = {
          id: `prof-${patientUser.id}`,
          userId: patientUser.id,
          bloodGroup: 'O+',
          dateOfBirth: '1990-05-15',
          gender: 'Male',
          allergies: ['Penicillin', 'Dust'],
          medicalHistory: ['Asthma', 'Hypertension'],
          emergencyContactName: 'Rohima Begum',
          emergencyContactPhone: '+8801712345678',
          nid: '1990123456789',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      setUser(patientUser);
      setProfile(patientProfile);
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<void> => {
    const patientUser: User = {
      id: 'usr-pat-google',
      name: 'Sakib Al Hasan',
      email: 'sakib@gmail.com',
      role: 'patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const patientProfile: Profile = {
      id: `prof-${patientUser.id}`,
      userId: patientUser.id,
      bloodGroup: 'A+',
      dateOfBirth: '1993-09-22',
      gender: 'Male',
      allergies: ['Peanuts'],
      medicalHistory: ['Mild Gastric Issues'],
      emergencyContactName: 'Moushumi Ahmed',
      emergencyContactPhone: '+8801811223344',
      nid: '1993888877776',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUser(patientUser);
    setProfile(patientProfile);
  };

  const updateProfile = (profileData: Partial<Profile>) => {
    if (profile) {
      const updated = {
        ...profile,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      setProfile(updated);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('hms_auth_user');
    localStorage.removeItem('hms_auth_profile');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      loginAsAdmin,
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      updateProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
