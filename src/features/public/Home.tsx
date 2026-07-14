import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HeartPulse, ShieldAlert, Award, Star, Activity } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';

export const Home: React.FC = () => {
  const { doctors } = useAppointments();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    { name: 'Cardiology', count: doctors.filter(d => d.specialty.includes('Cardiology')).length },
    { name: 'Gynecology', count: doctors.filter(d => d.specialty.includes('Gynecology')).length },
    { name: 'Pediatrics', count: doctors.filter(d => d.specialty.includes('Pediatrics')).length },
    { name: 'General Medicine', count: doctors.filter(d => d.specialty.includes('General')).length },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-primary text-white overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,_#fff_0%,_transparent_60%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/10">
              <Activity className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
              Over 25+ Specialized Medical Professionals
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Caring for Your Health, <br />
              Empowering Your Life.
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-lg">
              Welcome to the Hospital Management System (HMS). Schedule expert consultations, check available live ward beds, track dynamic inventory supplies, and manage checkouts with absolute ease.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search physicians by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3 bg-white text-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm shadow-md"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          <div className="hidden md:block relative">
            <div className="w-72 h-72 bg-white/10 rounded-full absolute -top-8 -left-8 blur-2xl animate-pulse" />
            <div className="w-96 h-96 bg-blue-500/30 rounded-full absolute -bottom-12 -right-12 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"
              alt="Healthcare professionals"
              className="rounded-3xl shadow-2xl border-4 border-white/10 relative z-10 hover:scale-102 transition-transform duration-300 object-cover h-[350px]"
            />
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white border-y border-slate-100 shadow-sm relative z-10 -mt-8 max-w-4xl mx-auto rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6">
        <div className="p-4 text-center">
          <div className="text-3xl font-extrabold text-primary font-sans">25,000+</div>
          <div className="text-xs text-slate-500 mt-1">Patients Cured</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-extrabold text-slate-800 font-sans">45+</div>
          <div className="text-xs text-slate-500 mt-1">Specialists</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-extrabold text-slate-800 font-sans">150+</div>
          <div className="text-xs text-slate-500 mt-1">Hospital Beds</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-extrabold text-emerald-600 font-sans">99.8%</div>
          <div className="text-xs text-slate-500 mt-1">Satisfaction Rate</div>
        </div>
      </section>

      {/* Departments Category Chips */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Our Clinical Specialties</h2>
          <p className="text-xs text-slate-500">Explore our dynamic specialized clinical departments operating under rigorous quality control standards.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept, i) => (
            <div
              key={i}
              onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(dept.name)}`)}
              className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between h-[120px]"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">{dept.name}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {dept.count} active physicians
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 text-center p-4">
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Certified Specialists</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Our medical panel undergoes careful audits and ratings feedback loops to assure top quality.</p>
          </div>
          <div className="space-y-2 text-center p-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Patient-First Care</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Leave reviews anonymously or publicly, check historical consultations, and track bills.</p>
          </div>
          <div className="space-y-2 text-center p-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Emergency Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">With live ward beds, emergency rooms, OTs, and round-the-clock intensive care units.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
