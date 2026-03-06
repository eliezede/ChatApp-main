import React, { useEffect, useState } from 'react';
import { StatsService } from '../../services/statsService';
import { useAuth } from '../../context/AuthContext';
import { BookingService, BillingService } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, ArrowRight, CheckCircle2,
  Calendar, PoundSterling, Star, MessageSquare,
  ChevronRight, AlertCircle, PlayCircle, Filter,
  Bell, Plus, LayoutGrid, Award, ShieldCheck,
  Video, Globe2, MoreVertical
} from 'lucide-react';
import { JobDetailsModal } from '../../components/interpreter/JobDetailsModal'; // Re-triggering HMR
import { useToast } from '../../context/ToastContext';
import { useChat } from '../../context/ChatContext';
import { ChatService } from '../../services/chatService';

// --- Sub-components for the New Design ---

const StatCard = ({ label, value, sublabel, icon: Icon, colorClass, highlight }: any) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 ${colorClass} opacity-5 group-hover:scale-110 transition-transform`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 shadow-sm`}>
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
      {highlight && (
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {highlight}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 leading-tight">{value}</h3>
      {sublabel && <p className="text-xs text-slate-500 mt-1 font-medium">{sublabel}</p>}
    </div>
  </div>
);

const ScheduleItem = ({ job, onClick }: { job: Booking, onClick: () => void }) => {
  const isPending = job.status === BookingStatus.OPENED;
  const isRemote = job.locationType === 'ONLINE';

  return (
    <div onClick={onClick} className="flex items-start group cursor-pointer py-4 first:pt-0 last:pb-0 border-b border-slate-50 last:border-0">
      <div className="flex flex-col items-center mr-6 text-center min-w-[48px]">
        <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
          {job.date ? new Date(job.date.includes('T') ? job.date : job.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' }) : '—'}
        </p>
        <p className="text-xl font-black text-slate-900 leading-none">
          {job.date ? new Date(job.date.includes('T') ? job.date : job.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit' }) : '—'}
        </p>
      </div>
      <div className="flex-1 bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all group-hover:shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{job.serviceType}</h4>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${isPending ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
            {isPending ? 'Pending' : 'Confirmed'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
          <span className="flex items-center"><Clock size={14} className="mr-1.5 text-blue-500" /> {job.startTime}</span>
          <span className="flex items-center">
            {isRemote ? <Video size={14} className="mr-1.5 text-indigo-500" /> : <MapPin size={14} className="mr-1.5 text-red-500" />}
            {isRemote ? 'Remote Call' : job.postcode || 'On-site'}
          </span>
          <span className="flex items-center font-bold text-slate-900"><Globe2 size={14} className="mr-1.5 text-slate-400" /> {job.languageFrom} → {job.languageTo}</span>
        </div>
      </div>
      {isRemote && !isPending && (
        <button className="ml-4 px-3 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase self-center whitespace-nowrap">
          Join Room
        </button>
      )}
    </div>
  );
};

const JobOfferCard = ({ offer, onClick }: { offer: Booking, onClick: () => void }) => {
  const isUrgent = offer.priority === 'High';
  const isDirect = offer.status === BookingStatus.OPENED;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <h4 className="font-bold text-slate-900 line-clamp-1">{offer.serviceType}</h4>
          {isDirect && (
            <span className="text-[9px] font-black text-blue-600 flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} /> Direct Assignment
            </span>
          )}
        </div>
        {isUrgent && (
          <span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded-full uppercase animate-pulse">
            Urgent
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-4 font-medium">Scheduled: {offer.date ? new Date(offer.date.includes('T') ? offer.date : offer.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBC'}</p>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600">
          <Globe2 size={12} className="mr-1 text-blue-500" /> {offer.languageFrom} → {offer.languageTo}
        </div>
        <div className="flex items-center bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600">
          {offer.locationType === 'ONLINE' ? <Video size={12} className="mr-1 text-indigo-500" /> : <MapPin size={12} className="mr-1 text-red-500" />}
          {offer.locationType === 'ONLINE' ? 'Video' : 'On-site'}
        </div>
      </div>

      <button className="w-full bg-blue-600 text-white text-xs font-black py-3 rounded-xl shadow-lg shadow-blue-600/10 hover:bg-blue-700 hover:shadow-blue-600/20 transition-all uppercase tracking-wider">
        Accept Job
      </button>
    </div>
  );
};

// --- Main Dashboard ---

export const InterpreterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openThread } = useChat();

  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Modal State
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data State
  const [upcomingJobs, setUpcomingJobs] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    completedBookings: 0,
    liveOffers: 0,
    upcomingBookings: 0,
    rating: 4.96,
    hoursWorked: '84.5h',
    nextPayout: '£4,280.00'
  });

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
      const [schedule, offerList, totalEarnings, realStats] = await Promise.all([
        BookingService.getInterpreterSchedule(interpreterId),
        BookingService.getInterpreterOffers(interpreterId),
        BillingService.getInterpreterEarnings(interpreterId),
        StatsService.getInterpreterStats(interpreterId)
      ]);

      // Categorize: BOOKED and beyond are 'Confirmed'
      // OPENED for this interpreter are 'Direct Assignments' (Pending)
      const confirmed = schedule.filter((b: Booking) => b.status !== BookingStatus.OPENED);
      const directPending = schedule.filter((b: Booking) => b.status === BookingStatus.OPENED);

      const upcoming = confirmed
        .filter((b: Booking) => new Date(b.date + 'T' + (b.startTime || '00:00')) > new Date())
        .sort((a: Booking, b: Booking) => new Date(a.date + 'T' + (a.startTime || '00:00')).getTime() - new Date(b.date + 'T' + (b.startTime || '00:00')).getTime());

      setUpcomingJobs(upcoming);

      // For each broadcast assignment, fetch the full booking document so we
      // have all display fields (date, startTime, serviceType, address, etc.)
      // We keep the ASSIGNMENT id on the merged object so acceptOffer/declineOffer work correctly.
      const enrichedOffers: Booking[] = await Promise.all(
        offerList.map(async (assignment: any) => {
          const bookingId = assignment.bookingId;
          if (!bookingId) {
            // Fallback: use whatever data is in the snapshot or assignment itself
            return { ...(assignment.bookingSnapshot || assignment), id: assignment.id };
          }
          try {
            const booking = await BookingService.getById(bookingId);
            if (booking) {
              // Merge: use full booking data but override `id` with the ASSIGNMENT id
              // so that acceptOffer(id) hits the assignment doc, not the booking doc.
              return { ...booking, id: assignment.id };
            }
          } catch {/* ignore */ }
          // Fallback to snapshot if booking fetch fails
          return { ...(assignment.bookingSnapshot || assignment), id: assignment.id };
        })
      );

      // Merge broadcast offers and direct assignments
      setOffers([...directPending, ...enrichedOffers]);

      setStats({
        completedBookings: realStats.completedBookings || 0,
        liveOffers: (realStats.liveOffers || 0) + directPending.length,
        upcomingBookings: upcoming.length,
        rating: 4.96,
        hoursWorked: '84.5h', // Mock for design
        nextPayout: `£${totalEarnings.toLocaleString('en-GB') || '0.00'}`
      });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const openJobModal = (job: Booking) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleAcceptJob = async (id: string) => {
    try {
      await BookingService.acceptOffer(id);
      showToast('Job accepted successfully!', 'success');
      if (user?.profileId) loadDashboardData(user.profileId);
    } catch (e) {
      showToast('Failed to accept job', 'error');
    }
  };

  const handleRejectJob = async (id: string) => {
    try {
      await BookingService.declineOffer(id);
      showToast('Job declined', 'info');
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (e) {
      showToast('Failed to decline job', 'error');
    }
  };

  const handleMessageAdmin = async (jobId: string) => {
    try {
      const adminId = 'admin-user-id'; // This would normally come from the booking or service
      const threadId = await ChatService.getOrCreateThread(
        [user!.id, adminId],
        { [user!.id]: user!.displayName || 'Interpreter', [adminId]: 'Admin' },
        jobId
      );
      openThread(threadId);
    } catch (e) {
      showToast('Failed to start chat', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center opacity-50 scale-95 transition-all duration-700">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Configuring Portal</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interpreter Portal</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isOnline ? 'Available for On-Call' : 'Currently Offline'}
            </div>
          </div>
          <p className="text-slate-500 font-medium">Ready for another day of excellence, {user?.displayName?.split(' ')[0]}?</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm relative group">
            <Bell size={20} />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => navigate('/interpreter/profile')} className="px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-wider">
            <Plus size={16} /> Update Availability
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Upcoming Jobs" value={stats.upcomingBookings} sublabel="Jobs scheduled" icon={Calendar} colorClass="bg-blue-600" highlight="+2 today" />
        <StatCard label="Hours Worked" value={stats.hoursWorked} sublabel="This Month" icon={Clock} colorClass="bg-indigo-600" />
        <StatCard label="Next Payout" value={stats.nextPayout} sublabel="Est. Dec 15" icon={PoundSterling} colorClass="bg-indigo-500" />
        <StatCard label="Average Rating" value={`${stats.rating}/5`} sublabel="Excellent performance" icon={Star} colorClass="bg-amber-500" highlight="Top 5%" />
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column: Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <LayoutGrid size={22} className="text-blue-600" /> Upcoming Schedule
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronRight size={18} className="rotate-180" /></button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>

            {upcomingJobs.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No Confirmed Sessions</p>
                <button onClick={() => navigate('/interpreter/jobs')} className="mt-4 text-blue-600 text-xs font-black hover:underline uppercase tracking-wider">Browse Marketplace &rarr;</button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingJobs.map((job) => (
                  <ScheduleItem key={job.id} job={job} onClick={() => openJobModal(job)} />
                ))}

                <button
                  onClick={() => navigate('/interpreter/jobs')}
                  className="w-full mt-6 py-4 flex items-center justify-center text-xs font-black text-slate-400 hover:text-blue-600 border border-dashed border-slate-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all uppercase tracking-wider gap-2"
                >
                  View Full Calendar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Offers & Health */}
        <div className="space-y-10">

          {/* Job Offers Sidebar */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Job Offers</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase">Based on expertise</span>
            </div>

            <div className="space-y-4">
              {offers.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-200 rounded-3xl text-center">
                  <Award size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-xs font-medium">Finding new roles...</p>
                </div>
              ) : (
                offers.slice(0, 3).map((offer) => (
                  <JobOfferCard key={offer.id} offer={offer} onClick={() => openJobModal(offer)} />
                ))
              )}

              {offers.length > 0 && (
                <button onClick={() => navigate('/interpreter/jobs')} className="w-full py-2 text-center text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">
                  View Marketplace ({stats.liveOffers})
                </button>
              )}
            </div>
          </div>

          {/* Certification / Action Card */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
            <ShieldCheck size={64} className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:rotate-12 transition-transform duration-700" />

            <div className="relative z-10">
              <h4 className="text-lg font-black mb-1">Certification Update</h4>
              <p className="text-blue-100 text-xs font-medium mb-6 opacity-80 leading-relaxed">Your HIPAA certification expires in 12 days. Renew now to stay active.</p>

              <button className="w-full bg-white text-blue-600 font-black py-3 rounded-xl text-xs shadow-lg hover:bg-blue-50 transition-all uppercase tracking-widest">
                Renew Certification
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Shared Job Details Modal */}
      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        onAccept={handleAcceptJob}
        onReject={handleRejectJob}
        onMessageAdmin={handleMessageAdmin}
      />
    </div>
  );
};