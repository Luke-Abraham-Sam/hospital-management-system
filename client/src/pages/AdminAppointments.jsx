import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/admin/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('[AdminAppointments Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  if (loading) return <LoadingSpinner label="Fetching system appointment logs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Master Appointment Records</h2>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive audit log of all system appointments</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments recorded"
          message="No appointment transactions exist in the database yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((app) => (
            <AppointmentCard
              key={app._id}
              appointment={app}
              userRole="ADMIN"
              onUpdateStatus={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
