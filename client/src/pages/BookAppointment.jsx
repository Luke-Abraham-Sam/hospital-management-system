import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(preselectedDoctorId);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [priority, setPriority] = useState('NORMAL');
  const [reason, setReason] = useState('');

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
          if (!selectedDoctorId && res.data.doctors.length > 0) {
            setSelectedDoctorId(res.data.doctors[0]._id);
          }
        }
      } catch (err) {
        console.error('[BookAppointment Error]', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch doctor availability whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !appointmentDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      setError('');
      try {
        const res = await API.get(`/doctors/${selectedDoctorId}/availability?date=${appointmentDate}`);
        if (res.data.success) {
          setAvailability(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch doctor availability slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available 30-minute time slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await API.post('/appointments', {
        doctorId: selectedDoctorId,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        priority,
        reason: reason || 'General Consultation'
      });

      if (res.data.success) {
        setSuccessBooking(res.data.appointment);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Slot may be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingDoctors) return <LoadingSpinner label="Preparing doctor schedule view..." />;

  const selectedDoctorInfo = doctors.find(d => d._id === selectedDoctorId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Book Doctor Appointment</h2>
        <p className="text-sm text-slate-500 mt-1">Select doctor, date, and available 30-minute slot</p>
      </div>

      {successBooking ? (
        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-8 text-center space-y-4 shadow-lg animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
          <p className="text-sm text-slate-600">Your appointment has been successfully scheduled.</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Queue Number:</span>
              <span className="font-mono font-bold text-sky-700 text-sm">{successBooking.queueNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-semibold text-slate-800">{selectedDoctorInfo?.userId?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-800">{successBooking.appointmentDate} at {successBooking.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className="font-semibold text-slate-800">{successBooking.priority}</span>
            </div>
          </div>

          <div className="flex justify-center space-x-3 pt-4">
            <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setSuccessBooking(null)}>
              Book Another
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Doctor & Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Select Doctor"
              id="doctorSelect"
              type="select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={doctors.map(d => ({
                value: d._id,
                label: `${d.userId?.name || 'Doctor'} (${d.specialization})`
              }))}
              required
            />

            <FormInput
              label="Select Date"
              id="appointmentDate"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          {/* Doctor Info Snippet */}
          {selectedDoctorInfo && (
            <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-sky-900">{selectedDoctorInfo.userId?.name}</p>
                <p className="text-sky-700">{selectedDoctorInfo.specialization} • {selectedDoctorInfo.department}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm">${selectedDoctorInfo.consultationFee}</span>
                <p className="text-[10px] text-slate-500">Consultation Fee</p>
              </div>
            </div>
          )}

          {/* 2. Available Slots Grid */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <Clock size={16} className="mr-1.5 text-sky-600" />
              Available Time Slots (30 min duration)
            </label>

            {loadingSlots ? (
              <LoadingSpinner label="Generating doctor availability slots..." />
            ) : !availability || !availability.isAvailable ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-center">
                Doctor is not available on {availability?.day || 'this date'}. Please select another day.
              </div>
            ) : availability.slots.length === 0 ? (
              <div className="p-4 bg-slate-100 rounded-xl text-slate-500 text-xs text-center">
                No slots configured for this day.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availability.slots.map((slot, index) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-sky-500 hover:bg-sky-50'
                      }`}
                    >
                      {slot.startTime}
                      <span className="block text-[9px] opacity-70 font-normal">
                        {slot.available ? 'Available' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Priority & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <FormInput
              label="Priority Level"
              id="priority"
              type="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'NORMAL', label: 'Normal Priority' },
                { value: 'URGENT', label: 'Urgent Priority (Moves higher in Queue)' }
              ]}
            />

            <FormInput
              label="Reason for Visit / Symptoms"
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fever, Routine checkup, ECG"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={bookingLoading}
              disabled={!selectedSlot}
              className="w-full py-3"
            >
              Confirm Appointment Booking
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;
