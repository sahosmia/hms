import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Input, Textarea } from '../../components/FormComponents';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill in all inquiry details.');
      return;
    }

    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-6xl mx-auto px-6 space-y-12">

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">Contact Us</h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">Get in touch with our team, request clinic support, or call our 24/7 round-the-clock emergency medical hotlines.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Quick Contacts */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Emergency Hotlines</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">General Hotline</p>
                    <p className="text-[11px] text-slate-500 font-sans">+880 2-10678, +880 1712-345678</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Cardiology ICU Emergency</p>
                    <p className="text-[11px] text-slate-500 font-sans">+880 1811-223344</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Hospital Address</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-700">Main Facility Location</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Plot 15, Road 2, Block-E, <br />
                      Mirpur, Dhaka - 1216, Bangladesh.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-700">Corporate & Support Email</p>
                    <p className="text-[11px] text-slate-500 font-sans">support@hms-hospital.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Send an Inquiry / Message</h3>

            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-3.5 border border-emerald-200 rounded-lg text-xs font-bold text-center animate-fadeIn">
                Your message has been dispatched successfully! Our support representative will contact you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g., john@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Textarea
                label="Inquiry Message"
                placeholder="Write your diagnostic inquiries, hospital support queries, or general feedbacks..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Send className="w-4 h-4" />
                Submit Message
              </button>
            </form>
          </div>

        </div>

        {/* Interactive Map Placeholder */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Campus Map Finder</h3>
          <div className="h-64 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-150 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="text-center relative z-10 space-y-2">
              <MapPin className="w-10 h-10 text-primary animate-bounce mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-800">Plot 15, Mirpur, Dhaka Campus</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Mock GPS Coordinates: 23.8041° N, 90.3625° E</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
