import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JobCard } from '../../components/JobCard';
import { Calendar as JobCalendar } from '../../components/Calendar';
import { useInterpreterJobOffers } from '../../hooks/useInterpreterJobOffers';
import { useInterpreterUpcomingJobs } from '../../hooks/useInterpreterUpcomingJobs';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, BarChart3, Clock, Briefcase, Calendar } from 'lucide-react';

type Tab = 'OFFERS' | 'UPCOMING';

export const InterpreterJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('OFFERS');

  const { offers, loading: offersLoading, acceptOffer, declineOffer } = useInterpreterJobOffers(user?.profileId);
  const { jobs, loading: jobsLoading } = useInterpreterUpcomingJobs(user?.profileId);

  const isLoading = offersLoading || jobsLoading;

  const handleDateClick = (date: Date) => {
    // Format to YYYY-MM-DD using local time to avoid timezone shifts
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const dateStr = d.toISOString().split('T')[0];
    const jobOnDay = jobs.find(j => j.date === dateStr);
    if (jobOnDay) {
      navigate(`/interpreter/jobs/${jobOnDay.id}`);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Work Center</h1>
          <p className="text-slate-500 font-bold mt-1">Manage your job offers and upcoming assignments</p>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Offers</div>
              <div className="text-xl font-black text-slate-900">{offers.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upcoming</div>
              <div className="text-xl font-black text-slate-900">{jobs.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 min-w-[160px]">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Performance</div>
              <div className="text-xl font-black text-slate-900">4.9</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('OFFERS')}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'OFFERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <List size={16} />
                Offers
              </button>
              <button
                onClick={() => setActiveTab('UPCOMING')}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase rounded-xl transition-all ${activeTab === 'UPCOMING' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <LayoutGrid size={16} />
                Upcoming
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="font-bold">Syncing your schedule...</span>
              </div>
            ) : (
              <>
                {activeTab === 'OFFERS' && (
                  offers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={32} />
                      </div>
                      <h3 className="text-slate-900 font-black">No pending offers</h3>
                      <p className="text-slate-400 text-sm font-bold mt-1">Check back later for new opportunities!</p>
                    </div>
                  ) : (
                    offers.map(offer => (
                      <JobCard
                        key={offer.id}
                        type="OFFER"
                        data={offer}
                        onAccept={acceptOffer}
                        onDecline={declineOffer}
                      />
                    ))
                  )
                )}

                {activeTab === 'UPCOMING' && (
                  jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} />
                      </div>
                      <h3 className="text-slate-900 font-black">Your schedule is empty</h3>
                      <p className="text-slate-400 text-sm font-bold mt-1">Assign to some jobs to see them here.</p>
                    </div>
                  ) : (
                    jobs.map(job => (
                      <JobCard
                        key={job.id}
                        type="UPCOMING"
                        data={job}
                        onClick={() => navigate(`/interpreter/jobs/${job.id}`)}
                      />
                    ))
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Calendar & Filters */}
        <div className="lg:col-span-4 space-y-6">
          <JobCalendar jobs={jobs} onDateClick={handleDateClick} />

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200">
            <h4 className="font-black text-lg mb-2">Pro Tip</h4>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Keep your profile updated and response times fast to increase your chances of receiving more premium offers!
            </p>
            <button
              onClick={() => navigate('/interpreter/profile')}
              className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase transition-all backdrop-blur-sm"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
