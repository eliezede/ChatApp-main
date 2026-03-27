import { useState, useEffect, useCallback } from 'react';
import { BookingService, InterpreterService } from '../services/api';
// Fix: Added BookingStatus to imports to satisfy enum requirement
import { Booking, BookingStatus } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all bookings
      const allBookings = await BookingService.getAll();
      const photoMap = await InterpreterService.getPhotoMap();
      
      const normalizedData = (allBookings ?? []).map((b: Booking) => ({
        ...b,
        clientName: b?.clientName ?? 'Unknown Client',
        status: b?.status ?? BookingStatus.INCOMING,
        bookingRef: b?.bookingRef ?? '',
        interpreterPhotoUrl: b.interpreterPhotoUrl || (b.interpreterId ? photoMap[b.interpreterId] : undefined)
      })) as Booking[];

      setBookings(normalizedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { bookings, loading, error, refresh: loadData };
};
