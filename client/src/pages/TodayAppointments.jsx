import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';

const TodayAppointments = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/appointments/doctor?date=${selectedDate}`);
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('[TodayAppointments Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Doctor Schedule</h2>
          <p className="text-sm text-slate-500 mt-0.5">View and update appointments by date</p>
        </div>

        <div className="w-full md:w-56">
          <FormInput
            id="scheduleDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching doctor schedule..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments scheduled"
          message={`No patient consultations found for ${selectedDate}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((app) => (
            <AppointmentCard
              key={app._id}
              appointment={app}
              userRole="DOCTOR"
              onUpdateStatus={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayAppointments;
