import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Star, MessageSquare } from 'lucide-react';

export const PublicDoctors: React.FC = () => {
  const { doctors, addDoctorReview } = useAppointments();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const querySearch = searchParams.get('search') || '';
  const querySpecialty = searchParams.get('specialty') || 'All';

  const [search, setSearch] = useState(querySearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(querySpecialty);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [reviewerName, setReviewerName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setSearch(querySearch);
    setSelectedSpecialty(querySpecialty);
  }, [querySearch, querySpecialty]);

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
      alert('Please enter your feedback comment.');
      return;
    }

    addDoctorReview(selectedDoctorId, {
      patientName: isAnonymous ? 'Anonymous' : (reviewerName || 'Arif Ahmed'),
      rating: ratingVal,
      comment: commentVal,
      anonymous: isAnonymous
    });

    setSuccessMsg('Thank you! Your feedback has been posted successfully.');
    setReviewerName('');
    setCommentVal('');
    setRatingVal(5);

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleBookClick = (doctorId: string) => {
    if (!isAuthenticated) {
      // Redirect to login page and remember where they came from
      navigate(`/patient/login?redirect=/patient/booking?doctorId=${doctorId}`);
    } else {
      navigate(`/patient/booking?doctorId=${doctorId}`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 font-sans">
      <div className="max-w-4xl mx-auto px-6 space-y-6">

        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Hospital Doctor Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Explore certified specialists, read patient reviews, and book instant clinical consultation slots.</p>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search physicians by name, specialty, or qualifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedSpecialty === spec
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {spec === 'All' ? 'All Departments' : spec}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex gap-4 items-start"
            >
              <img
                src={doc.imageUrl}
                alt={doc.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-100 bg-slate-100 shrink-0"
              />
              <div className="flex-grow min-w-0 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800 truncate">{doc.name}</h3>
                <p className="text-xs text-primary font-bold">{doc.specialty}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="font-bold ml-0.5">{doc.rating}</span>
                  </div>
                  <span>({doc.reviewCount} reviews)</span>
                  <span>•</span>
                  <span>{doc.experience} Yrs Exp</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-700">Fees: BDT {doc.fees}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setSuccessMsg('');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      Reviews
                    </button>
                    <button
                      onClick={() => handleBookClick(doc.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-primary hover:bg-blue-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedDoctor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase">Doctor Feedback History</h3>
                  <h4 className="text-sm font-bold text-slate-800 mt-0.5">{selectedDoctor.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedDoctorId(null)}
                  className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400"
                >
                  ✕
                </button>
              </div>

              <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-extrabold text-slate-800 font-sans">{selectedDoctor.rating}</div>
                  <div className="flex justify-center text-amber-500 my-0.5">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">Avg Rating ({selectedDoctor.reviewCount} users)</div>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="flex-1 px-4 text-xs space-y-1 text-slate-500">
                  <div>5 Stars: {selectedDoctor.reviews.filter(r=>r.rating===5).length} Patients</div>
                  <div>4 Stars: {selectedDoctor.reviews.filter(r=>r.rating===4).length} Patients</div>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1">
                <h5 className="text-xs font-bold text-slate-600">Patient Feedbacks ({selectedDoctor.reviews.length})</h5>
                {selectedDoctor.reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  selectedDoctor.reviews.map(rev => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">
                          {rev.anonymous ? 'Anonymous Patient' : rev.patientName}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-sans">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="font-semibold ml-0.5">{rev.rating}</span>
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
                  Leave An Honest Review
                </h5>

                {successMsg && (
                  <div className="bg-emerald-50 text-emerald-700 p-2.5 border border-emerald-200 rounded-lg text-xs font-bold text-center">
                    {successMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Star Count</label>
                    <select
                      value={ratingVal}
                      onChange={(e) => setRatingVal(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                      <option value={2}>⭐⭐ (2/5)</option>
                      <option value={1}>⭐ (1/5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Review Comments</label>
                  <textarea
                    value={commentVal}
                    onChange={(e) => setCommentVal(e.target.value)}
                    placeholder="Write details about doctor consultations, bedside manner, or prescription effectiveness..."
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-600">Post review anonymously?</span>
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
                  className="w-full py-2 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer font-sans"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
