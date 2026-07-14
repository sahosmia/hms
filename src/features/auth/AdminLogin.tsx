import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/FormComponents';
import { Mail, Lock, ShieldCheck, HelpCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const success = loginAsAdmin(email, password);
      setLoading(false);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Incorrect email or password. Demo access: admin@hms.com / admin123 or nurse@hms.com / nurse123');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full mx-4 bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[500px]">

        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-700 to-primary p-10 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(255,255,255,0.08)_0%,_transparent_50%)] pointer-events-none" />

          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider">HMS Admin Portal</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight">Hospital Administration (Admin)</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Login to schedule doctor rosters, manage ward bed allocations, check emergency surgeries, and track live financial invoice trends.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-xs space-y-1.5 border border-white/10">
            <span className="font-bold flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-blue-200" />
              Demo Credentials Accounts:
            </span>
            <div className="font-sans flex flex-col gap-0.5 text-blue-100">
              <div><b>Admin Email:</b> admin@hms.com / <b>Pass:</b> admin123</div>
              <div><b>Staff (Nurse) Email:</b> nurse@hms.com / <b>Pass:</b> nurse123</div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Admin Login (Staff Login)</h2>
              <p className="text-xs text-slate-500 mt-1">Access using your registered staff email and password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@hms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                disabled={loading}
              />

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs leading-relaxed font-semibold animate-fadeIn">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 disabled:bg-blue-300 transition-all cursor-pointer text-sm"
              >
                {loading ? 'Logging In...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center md:hidden bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
            <span className="font-bold flex items-center justify-center gap-1 text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Demo Accounts:
            </span>
            <div className="font-sans flex flex-col gap-0.5 text-[11px] text-slate-500">
              <div>admin@hms.com / admin123</div>
              <div>nurse@hms.com / nurse123</div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-6 font-sans">
            Authentication requires secure network connection. <br />
            &copy; 2026 HMS Tech Inc.
          </div>
        </div>

      </div>
    </div>
  );
};
