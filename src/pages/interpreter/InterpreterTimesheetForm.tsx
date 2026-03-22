
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingService, StorageService } from '../../services/api';
import { Booking, ServiceCategory } from '../../types';
import { useInterpreterTimesheets } from '../../hooks/useInterpreterTimesheets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ChevronLeft, Camera, Upload, Check, FileText } from 'lucide-react';

export const InterpreterTimesheetForm = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState<Booking | null>(null);
  const { submitTimesheet } = useInterpreterTimesheets(user?.profileId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    start: '',
    end: '',
    breakMins: 0,
    evidenceUrl: '',
    sessionMode: '' as string,
    travelTime: 0,
    mileage: 0,
    parking: 0,
    transport: 0,
    // Translation fields
    wordCount: 0,
    unitPrice: 0,
    units: 'words' as 'words' | 'pages' | 'documents' | 'hours'
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      BookingService.getById(bookingId).then(b => {
        setJob(b || null);
        if (b) {
          const mode = b.locationType === 'ONLINE' ? 'Videocall' : 'Face-to-Face';
          setFormData(prev => ({ ...prev, sessionMode: b.sessionMode || mode }));
        }
      });
    }
  }, [bookingId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `timesheets/${bookingId}/${Date.now()}_${file.name}`;
      const url = await StorageService.uploadFile(file, path);
      setFormData(prev => ({ ...prev, evidenceUrl: url }));
      showToast('File uploaded successfully', 'success');
    } catch (error) {
      showToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

    // Construct ISO dates
    const baseDate = job.date;
    const startISO = `${baseDate}T${formData.start}:00`;
    const endISO = `${baseDate}T${formData.end}:00`;

    await submitTimesheet({
      bookingId: job.id,
      clientId: job.clientId,
      actualStart: startISO,
      actualEnd: endISO,
      breakDurationMinutes: formData.breakMins,
      supportingDocumentUrl: formData.evidenceUrl,
      sessionMode: formData.sessionMode as any,
      travelTimeMinutes: formData.travelTime,
      mileage: formData.mileage,
      parking: formData.parking,
      transport: formData.transport,
      // Translation fields
      wordCount: formData.wordCount,
      unitPrice: formData.unitPrice,
      units: formData.units,
      interpreterAmountCalculated: job.serviceCategory === ServiceCategory.TRANSLATION ? formData.wordCount * formData.unitPrice : undefined
    });

    setIsSubmitting(false);
    showToast("Timesheet submitted successfully!", "success");
    navigate('/interpreter/timesheets');
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {job.serviceCategory === ServiceCategory.TRANSLATION ? 'Submit Translation Delivery' : 'Submit Timesheet'}
        </h1>
      </div>

      <div className="p-4 bg-blue-50 m-4 rounded-xl">
        <h2 className="font-bold text-blue-900">{job.clientName}</h2>
        <p className="text-sm text-blue-700">{new Date(job.date).toLocaleDateString()} • {job.startTime}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {job.serviceCategory === ServiceCategory.TRANSLATION ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Units (e.g. Words/Pages)</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
                  value={formData.wordCount}
                  onChange={e => setFormData({ ...formData, wordCount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 h-[52px]"
                  value={formData.units}
                  onChange={e => setFormData({ ...formData, units: e.target.value as any })}
                >
                  <option value="words">Words</option>
                  <option value="pages">Pages</option>
                  <option value="documents">Documents</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Price (£)</label>
              <input
                type="number"
                step="0.001"
                required
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Est. Translation Total: £{(formData.wordCount * formData.unitPrice).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
                  value={formData.start}
                  onChange={e => setFormData({ ...formData, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg"
                  value={formData.end}
                  onChange={e => setFormData({ ...formData, end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Break (Minutes)</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                value={formData.breakMins}
                onChange={e => setFormData({ ...formData, breakMins: parseInt(e.target.value) || 0 })}
              />
            </div>
          </>
        )}

        {job.serviceCategory !== ServiceCategory.TRANSLATION && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Travel Time (Min)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                  value={formData.travelTime}
                  onChange={e => setFormData({ ...formData, travelTime: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mileage (Miles)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                  value={formData.mileage}
                  onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parking (£)</label>
                <input
                  type="number" step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                  value={formData.parking}
                  onChange={e => setFormData({ ...formData, parking: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Public Transport (£)</label>
                <input
                  type="number" step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50"
                  value={formData.transport}
                  onChange={e => setFormData({ ...formData, transport: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Evidence (Signed Form)</label>
          <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center relative transition-colors ${formData.evidenceUrl ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {uploading ? (
              <div className="flex flex-col items-center text-blue-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            ) : formData.evidenceUrl ? (
              <div className="flex flex-col items-center text-green-600">
                <Check size={32} className="mb-2" />
                <span className="text-sm font-bold">File Attached</span>
                <span className="text-xs mt-1">Tap to change</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Upload size={32} className="mb-2" />
                <span className="text-sm font-medium">
                  {job.serviceCategory === ServiceCategory.TRANSLATION ? 'Upload Completed Translation' : 'Upload Signed Timesheet'}
                </span>
                <span className="text-xs mt-1">Image or PDF</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 mt-8"
        >
          {isSubmitting ? 'Sending...' : 'Submit Timesheet'}
        </button>
      </form>
    </div>
  );
};
