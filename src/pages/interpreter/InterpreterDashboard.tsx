import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookingService, BillingService } from '../../services/api';
import { Booking } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, ArrowRight, CheckCircle2, XCircle,
  CalendarDays, PoundSterling, Star, MessageSquare,
  ChevronRight, AlertCircle, PlayCircle, Filter
} from 'lucide-react';

// --- Sub-components ---

const StatusToggle = ({ isOnline, onToggle }: { isOnline: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`}></div>
      <div>
        <p className="font-bold text-slate-900 text-sm">Available for Work</p>
        <p className="text-xs text-slate-500">{isOnline ? 'You can receive instant job offers' : 'You are currently offline'}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`w-12 h-7 rounded-full transition-colors relative ${isOnline ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${isOnline ? 'left-6' : 'left-1'}`}></div>
    </button>
  </div>
);

const NextJobCard = ({ job, onCheckIn }: { job: Booking | null, onCheckIn: () => void }) => {
  if (!job) return (
    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 h-full flex flex-col items-center justify-center min-h-[200px]">
      <CalendarDays size={48} className="text-slate-200 mb-4" />
      <p className="text-slate-400 font-medium">No upcoming jobs today.</p>
      <p className="text-xs text-slate-400 mt-1">Enjoy your free time!</p>
    </div>
  );

  const startTime = new Date(`${job.date}T${job.startTime}`);
  const now = new Date();
  const diffMs = startTime.getTime() - now.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] p-6 lg:p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden h-full flex flex-col justify-between group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

      <div className="relative z-10 w-full">
        <div className="flex justify-between items-start mb-6">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-sm animate-pulse">
            Up Next
          </span>
          <div className="text-right">
            <p className="text-blue-100 text-xs font-medium mb-1 opacity-80">Starts in</p>
            <p className="text-3xl lg:text-4xl font-black tracking-tight font-mono">
              {hours > 0 ? `${hours}h ` : ''}{mins}m
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl lg:text-3xl font-bold mb-2 leading-tight">{job.serviceType}</h3>
          <p className="text-blue-100 text-sm lg:text-base flex items-center bg-blue-800/30 w-fit px-3 py-1.5 rounded-lg border border-blue-400/20">
            <MapPin size={16} className="mr-2 opacity-80" /> {job.location || 'Remote (Video Call)'}
          </p>
        </div>
      </div>

      <button
        onClick={onCheckIn}
        className="w-full bg-white text-blue-600 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center group/btn relative z-10"
      >
        <PlayCircle size={20} className="mr-2 group-hover/btn:scale-110 transition-transform" /> Check In Now
      </button>
    </div>
  );
};

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const QuickStat = ({ label, value, icon: Icon, color }: QuickStatProps) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:border-blue-200 transition-colors h-full">
    <div className={`w-12 h-12 rounded-full ${color} bg-opacity-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
  </div>
);

interface JobOfferCardProps {
  offer: Booking;
  onAccept: () => void;
  onDecline: () => void;
}

const JobOfferCard = ({ offer, onAccept, onDecline }: JobOfferCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center">
        <span className="font-black text-slate-900 text-xl mr-2">EN</span>
        <ArrowRight size={16} className="text-slate-300" />
        <span className="font-black text-slate-900 text-xl ml-2">{offer.languageTo || 'ES'}</span>
      </div>
      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">
        £45.00
      </span>
    </div>

    <h4 className="font-bold text-slate-800 text-base mb-1">{offer.serviceType}</h4>
    <div className="flex items-center text-xs text-slate-500 mb-5 space-x-4">
      <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md"><Clock size={12} className="mr-1.5" /> 1h</span>
      <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md"><MapPin size={12} className="mr-1.5" /> {offer.postcode || 'Remote'}</span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button onClick={onDecline} className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors">Decline</button>
      <button onClick={onAccept} className="py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition-all">Accept</button>
    </div>
  </div>
);

interface TimelineItemProps {
  time: string;
  title: string;
  org: string;
  isLast?: boolean;
}

const TimelineItem = ({ time, title, org, isLast }: TimelineItemProps) => (
  <div className="flex group relative pl-2">
    <div className="flex flex-col items-center mr-4">
      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors z-10 ring-4 ring-white"></div>
      {!isLast && <div className="w-0.5 h-full bg-slate-100 my-1 group-hover:bg-slate-200 transition-colors"></div>}
    </div>
    <div className="pb-8 w-full">
      <p className="text-xs font-bold text-slate-400 mb-1">{time}</p>
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:border-blue-100 transition-colors">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{org}</p>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export const InterpreterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Data State
  const [upcomingJobs, setUpcomingJobs] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState('£0.00');

  useEffect(() => {
    if (user?.profileId) {
      loadDashboardData(user.profileId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async (interpreterId: string) => {
    setLoading(true);
    try {
      const [schedule, offerList, totalEarnings] = await Promise.all([
        BookingService.getInterpreterSchedule(interpreterId),
        BookingService.getInterpreterOffers(interpreterId),
        BillingService.getInterpreterEarnings(interpreterId)
      ]);

      const upcoming = schedule
        .filter((b: Booking) => new Date(b.date + 'T' + b.startTime) > new Date())
        .sort((a: Booking, b: Booking) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());

      setUpcomingJobs(upcoming);
      setOffers(offerList);
      setEarnings(`£${totalEarnings.toFixed(2)}`);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    alert("Checked in successfully! Waiting for client...");
  };

  const handleAccept = (id: string) => {
    alert(`Accepted job offer ${id}`);
    setOffers((prev: Booking[]) => prev.filter((o: Booking) => o.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const nextJob = upcomingJobs[0] || null;

  return (
    <div className="max-w-7xl mx-auto pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Good Morning, {user?.displayName?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50 flex items-center">
            <Filter size={16} className="mr-2" /> Filters
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Left Column (Main) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">

          {/* Status & Next Job */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* On Mobile: Status on top, On Desktop: Status card alongside job or above */}
            <div className="md:col-span-2">
              <StatusToggle isOnline={isOnline} onToggle={() => setIsOnline(!isOnline)} />
            </div>

            <div className="md:col-span-2">
              <NextJobCard job={nextJob} onCheckIn={handleCheckIn} />
            </div>
          </div>

          {/* Job Offers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center">
                Live Offers
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{offers.length}</span>
              </h3>
              <button className="text-sm text-blue-600 font-bold hover:text-blue-700">View All</button>
            </div>

            {offers.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-slate-400 font-medium">No active offers at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.slice(0, 4).map((offer: Booking, i: number) => (
                  <JobOfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={() => handleAccept(offer.id)}
                    onDecline={() => setOffers((prev: Booking[]) => prev.filter((o: Booking) => o.id !== offer.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6 lg:space-y-8">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            <QuickStat label="Earnings" value={earnings} icon={PoundSterling} color="bg-emerald-500" />
            <QuickStat label="Jobs Done" value={upcomingJobs.length + 2} icon={CheckCircle2} color="bg-blue-500" />
            <QuickStat label="Rating" value="4.9" icon={Star} color="bg-amber-500" />
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Today's Schedule</h3>
              <button onClick={() => navigate('/interpreter/jobs')} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            </div>

            {upcomingJobs.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarDays size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-slate-400 text-xs">No bookings for today.</p>
              </div>
            ) : (
              <div className="mt-2">
                {upcomingJobs.map((job: Booking, i: number) => (
                  <TimelineItem
                    key={job.id}
                    time={job.startTime}
                    title={job.serviceType}
                    org={job.clientName}
                    isLast={i === upcomingJobs.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
            <h4 className="font-bold text-lg mb-2 relative z-10">Need Help?</h4>
            <p className="text-slate-300 text-xs mb-4 relative z-10">Contact support for urgent issues with ongoing jobs.</p>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 text-xs font-bold transition-colors flex items-center justify-center relative z-10">
              <MessageSquare size={16} className="mr-2" /> Chat Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};