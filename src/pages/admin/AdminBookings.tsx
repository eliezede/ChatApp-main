import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { StatusBadge } from '../../components/StatusBadge';
import { Search, MapPin, Video, Plus, Clock, UserPlus, Building2, Globe2, User, UserCheck, X, Mail, Phone, Calendar, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { ClientService, InterpreterService, BookingService as RawBookingService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Interpreter, Booking, BookingStatus } from '../../types';

export const AdminBookings = () => {
  const { bookings = [], loading, error, refresh } = useBookings();
  const [filter, setFilter] = useState('');
  const [allInterpreters, setAllInterpreters] = useState<Interpreter[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedInterpreter, setSelectedInterpreter] = useState<Interpreter | null>(null);
  const [isInterpreterModalOpen, setIsInterpreterModalOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    ClientService.getAll();
    loadInterpreters();
  }, []);

  const loadInterpreters = async () => {
    try {
      const ints = await InterpreterService.getAll();
      setAllInterpreters(ints.filter(i => i.status === 'ACTIVE'));
    } catch (e) {
      console.error("Failed to load interpreters");
    }
  };

  const handleAssignClick = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setAssignSearch(booking.languageTo); // Pre-fill with language
    setIsAssignModalOpen(true);
  };

  const confirmAssign = async (interpreter: Interpreter) => {
    if (!selectedBooking) return;
    setAssignLoading(true);
    try {
      await RawBookingService.assignInterpreterToBooking(selectedBooking.id, interpreter.id);
      setIsAssignModalOpen(false);
      refresh();
    } catch (e) {
      alert("Failed to assign interpreter");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassign = async (e: React.MouseEvent, bookingId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to unassign this interpreter?")) return;
    setUnassigningId(bookingId);
    try {
      await RawBookingService.unassignInterpreterFromBooking(bookingId);
      refresh();
    } catch (e) {
      alert("Failed to unassign interpreter");
    } finally {
      setUnassigningId(null);
    }
  };

  const handleInterpreterClick = (e: React.MouseEvent, interpreterId: string) => {
    e.stopPropagation();
    const interp = allInterpreters.find(i => i.id === interpreterId);
    if (interp) {
      setSelectedInterpreter(interp);
      setIsInterpreterModalOpen(true);
    }
  };

  const safe = (val: unknown) => String(val ?? "").toLowerCase();

  const filteredBookings = (bookings ?? []).filter(b => {
    const q = safe(filter);
    return (
      safe(b?.clientName).includes(q) ||
      safe(b?.guestContact?.organisation).includes(q) ||
      safe(b?.status).includes(q) ||
      safe(b?.bookingRef).includes(q) ||
      safe(b?.languageTo).includes(q) ||
      safe(b?.interpreterName).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-500 text-sm">System-wide requests</p>
        </div>
        <Button onClick={() => navigate('/admin/bookings/new')} icon={Plus}>Create Booking</Button>
      </div>

      <Card padding="sm" className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search clients, ref or status..."
            className="pl-10 pr-4 py-2 border-none w-full focus:ring-0 outline-none text-sm bg-transparent text-gray-900"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </Card>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="py-12 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={filter ? "Adjust your search filters." : "No bookings in the system."}
          actionLabel={filter ? "Clear Filters" : "Refresh"}
          onAction={filter ? () => setFilter('') : refresh}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref / Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interpreter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600 hidden sm:block">
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-gray-900 leading-none">
                            {new Date(booking.date).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-sm font-bold text-blue-600 mt-0.5">{booking.startTime}</div>
                          <div className="text-[10px] font-mono text-gray-400 uppercase mt-1">Ref: {booking.bookingRef || 'TBD'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{booking.guestContact?.organisation || booking.clientName}</div>
                          <div className="text-xs text-gray-500">{booking.guestContact?.name || 'Main Contact'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-bold text-gray-800">
                          <Globe2 size={14} className="mr-1.5 text-blue-500" />
                          {booking.languageFrom} &rarr; {booking.languageTo}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          {booking.locationType === 'ONLINE' ? <Video size={12} className="mr-1.5 text-indigo-500" /> : <MapPin size={12} className="mr-1.5 text-red-500" />}
                          {booking.serviceType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.interpreterId ? (
                        <div className="flex items-center group/int">
                          <button
                            onClick={(e) => handleInterpreterClick(e, booking.interpreterId!)}
                            className="flex items-center hover:bg-gray-100 p-1.5 rounded-lg transition-colors text-left"
                          >
                            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mr-2">
                              <UserCheck size={14} />
                            </div>
                            <span className="text-xs font-bold text-gray-900 border-b border-transparent hover:border-emerald-600">{booking.interpreterName || 'Assigned'}</span>
                          </button>
                          <button
                            onClick={(e) => handleUnassign(e, booking.id)}
                            disabled={unassigningId === booking.id}
                            className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover/int:opacity-100"
                            title="Retirar assignação"
                          >
                            {unassigningId === booking.id ? <Spinner size="xs" /> : <X size={14} />}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAssignClick(e, booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-black uppercase hover:bg-amber-100 transition-colors border border-amber-100"
                        >
                          <UserPlus size={14} />
                          Asignar
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Asignar Intérprete para ${selectedBooking?.bookingRef}`}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou idioma..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm"
              value={assignSearch}
              onChange={e => setAssignSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
            {allInterpreters
              .filter(i =>
                i.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                i.languages.some(l => l.toLowerCase().includes(assignSearch.toLowerCase()))
              )
              .map(interpreter => (
                <div
                  key={interpreter.id}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mr-3 font-black text-sm">
                      {interpreter.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{interpreter.name}</p>
                      <p className="text-[10px] text-gray-500">{interpreter.languages.slice(0, 3).join(', ')}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => confirmAssign(interpreter)}
                    isLoading={assignLoading}
                  >
                    Asignar
                  </Button>
                </div>
              ))}
            {allInterpreters.length === 0 && <p className="text-center text-gray-400 py-4 text-sm font-medium">Nenhum intérprete encontrado.</p>}
          </div>
        </div>
      </Modal>

      {/* Interpreter Info Modal */}
      <Modal
        isOpen={isInterpreterModalOpen}
        onClose={() => setIsInterpreterModalOpen(false)}
        title="Interpreter Profile"
      >
        {selectedInterpreter && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-black">
                {selectedInterpreter.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{selectedInterpreter.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">{selectedInterpreter.status}</span>
                  {selectedInterpreter.isAvailable && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Available</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Contact Info</label>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Mail size={14} /> {selectedInterpreter.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Phone size={14} /> {selectedInterpreter.phone}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">DBS Security</label>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Calendar size={14} /> Expires: {selectedInterpreter.dbsExpiry}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Languages</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedInterpreter.languages.map(l => (
                      <span key={l} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Regions</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedInterpreter.regions.map(r => (
                      <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button onClick={() => setIsInterpreterModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};