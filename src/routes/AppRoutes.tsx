import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { PatientOtpLogin } from '../features/auth/PatientOtpLogin';
import { AdminLogin } from '../features/auth/AdminLogin';
import { PatientDashboard } from '../features/patient/PatientDashboard';
import { AppointmentStepper } from '../features/doctor/AppointmentStepper';
import { BookingHistory } from '../features/patient/BookingHistory';
import { NurseFeed } from '../features/clinical/NurseFeed';
import { BedDashboard } from '../features/clinical/BedDashboard';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { SurgeryScheduler } from '../features/ot/SurgeryScheduler';

import { Home } from '../features/public/Home';
import { About } from '../features/public/About';
import { PublicDoctors } from '../features/public/PublicDoctors';
import { Contact } from '../features/public/Contact';

import { PublicNavbar } from '../components/PublicNavbar';

import { HeartPulse, LayoutDashboard, Stethoscope, History, Calendar, Bed, ClipboardList, LogOut, Users } from 'lucide-react';

const PatientGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'patient') {
    // Save where they wanted to go
    return <Navigate to={`/patient/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
};

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pb-16">
        {children}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs font-sans">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p className="text-white font-bold">HMS Hospital Management System</p>
          <p>Providing premium healthcare services, clinical roster scheduling, live bed grid state trackers, and invoice checkout portals.</p>
          <p className="text-slate-500 pt-2">&copy; 2026 HMS Healthcare Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, roles: ['admin'] },
    { label: 'Employee Management', path: '/admin/employees', icon: <Users className="w-4.5 h-4.5" />, roles: ['admin'] },
    { label: 'Medication & Vitals Feed', path: '/admin/nurse', icon: <ClipboardList className="w-4.5 h-4.5" />, roles: ['admin', 'staff'] },
    { label: 'Bed Occupancy Grid', path: '/admin/beds', icon: <Bed className="w-4.5 h-4.5" />, roles: ['admin', 'staff'] },
    { label: 'OT Surgery & Inventory', path: '/admin/surgery', icon: <Stethoscope className="w-4.5 h-4.5" />, roles: ['admin'] },
  ];

  const currentRole = user?.role || 'staff';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:flex flex-col justify-between shrink-0 font-sans">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="font-bold text-white text-base tracking-wider">HMS Administrator</span>
          </div>

          <div className="space-y-1">
            {navItems
              .filter(item => item.roles.includes(currentRole))
              .map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 space-y-3.5 bg-slate-950/40">
          <div>
            <div className="text-xs font-bold text-white">{user?.name}</div>
            <div className="text-[10px] text-slate-400 capitalize mt-0.5">Role: {user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-800 hover:bg-rose-900/65 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="bg-slate-900 text-white p-4 flex md:hidden justify-between items-center sticky top-0 z-30 font-sans">
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-5 h-5 text-primary" />
            <span className="font-bold text-xs">HMS Admin</span>
          </div>
          <div className="flex gap-2">
            {navItems
              .filter(item => item.roles.includes(currentRole))
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-1.5 rounded-lg text-white ${location.pathname === item.path ? 'bg-primary' : ''}`}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}
            <button onClick={handleLogout} className="p-1.5 hover:bg-rose-950 rounded-lg">
              <LogOut className="w-4.5 h-4.5 text-rose-400" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const PatientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/patient/login');
  };

  const menuItems = [
    { label: 'Home', path: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Doctors', path: '/doctors', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Book Slot', path: '/patient/booking', icon: <Calendar className="w-5 h-5" /> },
    { label: 'History', path: '/patient/history', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 p-1 px-4 flex justify-between items-center shadow-lg z-30 max-w-md mx-auto">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all ${
                isActive ? 'text-primary font-extrabold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-[9px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 py-1.5 flex flex-col items-center justify-center text-rose-500 hover:text-rose-700 cursor-pointer font-sans"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Log Out</span>
        </button>
      </nav>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/doctors" element={<PublicLayout><PublicDoctors /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Patient Auth (Public page) */}
      <Route path="/patient/login" element={<PatientOtpLogin />} />

      {/* Patient Protected Portal Pages */}
      <Route
        path="/patient/dashboard"
        element={
          <PatientGuard>
            <PatientLayout>
              <PatientDashboard />
            </PatientLayout>
          </PatientGuard>
        }
      />
      <Route
        path="/patient/booking"
        element={
          <PatientGuard>
            <PatientLayout>
              <AppointmentStepper />
            </PatientLayout>
          </PatientGuard>
        }
      />
      <Route
        path="/patient/history"
        element={
          <PatientGuard>
            <PatientLayout>
              <BookingHistory />
            </PatientLayout>
          </PatientGuard>
        }
      />

      {/* Admin Auth & Dashboard */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminGuard>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminGuard>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <AdminGuard>
            <AdminLayout>
              <AdminDashboard initialTab="staff" />
            </AdminLayout>
          </AdminGuard>
        }
      />
      <Route
        path="/admin/nurse"
        element={
          <AdminGuard>
            <AdminLayout>
              <NurseFeed />
            </AdminLayout>
          </AdminGuard>
        }
      />
      <Route
        path="/admin/beds"
        element={
          <AdminGuard>
            <AdminLayout>
              <BedDashboard />
            </AdminLayout>
          </AdminGuard>
        }
      />
      <Route
        path="/admin/surgery"
        element={
          <AdminGuard>
            <AdminLayout>
              <SurgeryScheduler />
            </AdminLayout>
          </AdminGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
