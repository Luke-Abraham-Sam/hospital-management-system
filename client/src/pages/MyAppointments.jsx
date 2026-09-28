import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL'); // ALL, UPCOMING, PAST

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/my');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('[MyAppointments Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (tab === 'UPCOMING') return app.status !== 'CANCELLED' && app.status !== 'COMPLETED';
    if (tab === 'PAST') return app.status === 'COMPLETED' || app.status === 'CANCELLED';
    return true;
  });

  if (loading) return <LoadingSpinner label="Retrieving your appointments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-sm text-slate-500 mt-1">Track queue status, view history, or cancel upcoming visits</p>
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-1 bg-slate-200/80 p-1 rounded-xl w-fit text-xs font-semibold">
          <button
            onClick={() => setTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'UPCOMING' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab('PAST')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tab === 'PAST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past / Cancelled
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          message={tab === 'UPCOMING' ? 'You have no upcoming appointments.' : 'No appointment records available.'}
          actionText="Book New Appointment"
          onAction={() => window.location.href = '/patient/book'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((app) => (
            <AppointmentCard
              key={app._id}
              appointment={app}
              userRole="PATIENT"
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
