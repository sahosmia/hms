import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogIn, LayoutDashboard } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const handleDashboardRedirect = () => {
    if (user?.role === 'patient') {
      navigate('/patient/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-xs font-sans">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-primary rounded-lg">
            <HeartPulse className="w-5 h-5 text-primary" />
          </div>
          <span className="font-extrabold text-slate-800 tracking-wider text-base">HMS Healthcare</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link, idx) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={idx}
                to={link.path}
                className={`text-xs font-bold transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Authentication CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleDashboardRedirect}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Portal Dashboard
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/patient/login"
                className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Patient Login
              </Link>
              <Link
                to="/admin/login"
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer hidden sm:inline-flex"
              >
                Staff Access
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
