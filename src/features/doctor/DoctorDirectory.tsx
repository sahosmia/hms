import React, { useState } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { Search, Star, MessageSquare } from 'lucide-react';

export const DoctorDirectory: React.FC = () => {
  const { doctors, addDoctorReview } = useAppointments();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [reviewerName, setReviewerName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const specialties = ['All', 'Cardiology', 'Gynecology', 'Pediatrics', 'General Medicine'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                          doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    if (!commentVal.trim()) {
      alert('অনুগ্রহ করে আপনার মন্তব্য লিখুন।');
      return;
    }

    addDoctorReview(selectedDoctorId, {
      patientName: isAnonymous ? 'Anonymous' : (reviewerName || 'আরিফ আহমেদ (Arif Ahmed)'),
      rating: ratingVal,
      comment: commentVal,
      anonymous: isAnonymous
    });

    setSuccessMsg('আপনার রিভিউটি সফলভাবে গৃহীত হয়েছে!');
    setReviewerName('');
    setCommentVal('');
    setRatingVal(5);

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 font-bengali pb-20">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">ডাক্তার ডিরেক্টরি (Doctor List)</h2>
        <p className="text-xs text-slate-500 mt-0.5">অভিজ্ঞ ডাক্তার খুঁজে রিভিউ ও শিডিউল চেক করুন</p>
      </div>

      <div className="relative flex items-center mb-4">
        <Search className="absolute left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="ডাক্তারের নাম বা স্পেশালিটি খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bengali shadow-xs"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin">
        {specialties.map(spec => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSpecialty === spec
                ? 'bg-primary text-white border-primary shadow-sm shadow-blue-150'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {spec === 'All' ? 'সব বিভাগ' : spec}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex gap-3 items-start"
          >
            <img
              src={doc.imageUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200'}
              alt={doc.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-slate-100 font-sans"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-slate-800 leading-tight truncate">{doc.name}</h3>
              <p className="text-[11px] text-primary font-bold mt-1">{doc.specialty}</p>

              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500 animate-pulse" />
                  <span className="font-bold ml-0.5">{doc.rating}</span>
                </div>
                <span className="text-slate-400">({doc.reviewCount} রিভিউ)</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">অভিজ্ঞতা: {doc.experience} বছর</span>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
                <span className="text-xs font-bold text-slate-700">ফি: ৳ {doc.fees}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedDoctorId(doc.id);
                      setSuccessMsg('');
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                  >
                    রিভিউ দেখুন
                  </button>
                  <a
                    href={`/patient/booking?doctorId=${doc.id}`}
                    className="px-2.5 py-1 text-[10px] font-bold bg-primary hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
                  >
                    বুক করুন
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-slideUp">

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase">ডক্টর রেটিং ও রিভিউ</h3>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{selectedDoctor.name}</h4>
              </div>
              <button
                onClick={() => setSelectedDoctorId(null)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-2xl font-extrabold text-slate-800 font-sans">{selectedDoctor.rating}</div>
                <div className="flex justify-center text-amber-500 my-0.5">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div className="text-[10px] text-slate-400">গড় রেটিং ({selectedDoctor.reviewCount} জন)</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex-1 px-4 text-xs space-y-1 text-slate-500">
                <div>৫ তারকা: {selectedDoctor.reviews.filter(r=>r.rating===5).length} জন</div>
                <div>৪ তারকা: {selectedDoctor.reviews.filter(r=>r.rating===4).length} জন</div>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              <h5 className="text-xs font-bold text-slate-600">রোগীদের মন্তব্য ({selectedDoctor.reviews.length})</h5>
              {selectedDoctor.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">বর্তমানে কোনো মন্তব্য নেই। প্রথম রিভিউ দিন!</p>
              ) : (
                selectedDoctor.reviews.map(rev => (
                  <div key={rev.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700">
                        {rev.anonymous ? 'বেনামী রোগী' : rev.patientName}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-semibold ml-0.5 font-sans">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block font-sans">{rev.createdAt}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="border-t border-slate-100 pt-4 space-y-3">
              <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-primary" />
                আপনার রিভিউ দিন
              </h5>

              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 p-2.5 border border-emerald-200 rounded-lg text-xs font-bold text-center">
                  {successMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">আপনার নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="যেমন: আরিফ আহমেদ"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">স্টার রেটিং দিন</label>
                  <select
                    value={ratingVal}
                    onChange={(e) => setRatingVal(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                    <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                    <option value={3}>⭐⭐⭐ (৩/৫)</option>
                    <option value={2}>⭐⭐ (২/৫)</option>
                    <option value={1}>⭐ (১/৫)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">মন্তব্য (Comment)</label>
                <textarea
                  value={commentVal}
                  onChange={(e) => setCommentVal(e.target.value)}
                  placeholder="ডাক্তারের পরামর্শ ও সেবা কেমন লাগলো লিখুন..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bengali bg-white"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-600">বেনামে রিভিউ দিতে চান? (Anonymous)</span>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonymous ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isAnonymous ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
              >
                সাবমিট রিভিউ (Submit Review)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
