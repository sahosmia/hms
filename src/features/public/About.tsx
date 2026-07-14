import React from 'react';
import { Award, Compass, ShieldAlert, HeartPulse } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen font-sans py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-12">

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">About Our Hospital</h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">Discover our history, state-of-the-art medical equipment, facilities, and clinical standards.</p>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-md h-64 md:h-80">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
            alt="Hospital facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40 flex items-end p-6 md:p-10">
            <p className="text-white text-base md:text-lg font-semibold max-w-xl leading-relaxed">
              "We provide standard healthcare services with state-of-the-art medical machinery and top specialists."
            </p>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Our Mission</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              To deliver premium quality healthcare, medical consultations, and emergency ICU, Cabin, and Ward care with precision, care, and continuous patient oversight.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Our Vision</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              To be the most trusted and API-ready healthcare provider in the region, offering patient data safety, dynamic billing checkouts, and fully automated operations scheduling.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 text-center">Our Pillars of Healthcare Excellence</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Elite Specialists</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Consult with board-certified physicians specializing in Cardiology, Gynecology, Pediatrics, and General Medicine.
              </p>
            </div>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Real-Time Beds</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Live monitoring grids for Ward Beds, ICU, and CCU allocations ensures prompt admission with zero waiting periods.
              </p>
            </div>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Transparent Billing</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Dynamic service debits log consumables, doctor fees, and daily room charges cleanly into invoice checkers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
