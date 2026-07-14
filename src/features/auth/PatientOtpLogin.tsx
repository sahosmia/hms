import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input, OtpGrid } from '../../components/FormComponents';
import { Smartphone, HelpCircle, ShieldAlert, HeartPulse } from 'lucide-react';

export const PatientOtpLogin: React.FC = () => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.match(/^(\+88)?01[3-9]\d{8}$/)) {
      setError('সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setSimulatedOtp(res.otp);
      setStep('otp');
    } catch {
      setError('ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 4) {
      setError('৪ ডিজিটের ওটিপি কোড সম্পূর্ণ করুন');
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOtp(phone, otp);
      if (success) {
        navigate('/patient/dashboard');
      } else {
        setError('ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোড দিন অথবা "1234" ব্যবহার করুন।');
      }
    } catch {
      setError('যাচাইকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/patient/dashboard');
    } catch {
      setError('গুগল লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 font-bengali">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative flex flex-col min-h-[600px] hover:shadow-2xl transition-all duration-300">

        <div className="bg-primary px-6 py-10 text-white text-center flex flex-col items-center gap-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,_#fff_0%,_transparent_60%)] pointer-events-none" />
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <HeartPulse className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">হসপিটাল পোর্টাল (HMS)</h1>
            <p className="text-blue-100 text-xs mt-1">সহজে বুকিং, রিপোর্ট ও ইনডোর সেবা ট্র্যাকিং</p>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">পেশেন্ট ওটিপি লগইন (Patient Login)</h2>
                  <p className="text-xs text-slate-500 mt-1">আপনার সচল মোবাইল নম্বর দিয়ে ওটিপি পাঠান</p>
                </div>

                <Input
                  label="মোবাইল নম্বর"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Smartphone className="w-5 h-5" />}
                  error={error}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-95 disabled:bg-blue-300 transition-all cursor-pointer text-sm"
                >
                  {loading ? 'ওটিপি পাঠানো হচ্ছে...' : 'ওটিপি পাঠান (Send OTP)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">ওটিপি যাচাই করুন (Verify OTP)</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-primary">{phone}</span> নম্বরে পাঠানো ৪ ডিজিটের কোডটি দিন
                  </p>
                </div>

                {simulatedOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-center flex items-center justify-center gap-1.5 font-sans">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>সিমুলেটেড ওটিপি: <b>{simulatedOtp}</b> (অথবা টেস্ট ওটিপি <b>1234</b> দিন)</span>
                  </div>
                )}

                <OtpGrid value={otp} onChange={setOtp} />

                {error && <p className="text-xs text-red-500 text-center font-bold mt-1">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError('');
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    নম্বর পরিবর্তন
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 disabled:bg-blue-300 transition-all cursor-pointer"
                  >
                    {loading ? 'যাচাই করা হচ্ছে...' : 'যাচাই করুন (Verify)'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-medium uppercase font-sans">অথবা</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm text-xs cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                গুগল দিয়ে লগইন করুন (Google Login)
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 mt-6 font-sans">
            নিরাপদ যোগাযোগ নিশ্চিত করতে OTP সিস্টেম সচল রয়েছে। <br />
            &copy; 2026 HMS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};
