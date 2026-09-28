import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Calendar, Clock, UserCheck, PlusCircle } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/my');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('[PatientDashboard Error]', err);
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

  const activeAppointments = appointments.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
  const nextAppointment = activeAppointments.length > 0 ? activeAppointments[0] : null;

  if (loading) return <LoadingSpinner label="Loading your patient dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h2>
          <p className="text-sky-100 text-sm mt-1">Manage your appointments, view live queue status, and consult with doctors.</p>
        </div>
        <Link
          to="/patient/book"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-sky-700 hover:bg-sky-50 font-semibold text-sm rounded-xl transition-colors shadow-sm self-start md:self-auto"
        >
          <PlusCircle size={18} className="mr-2" />
          Book New Appointment
        </Link>
      </div>

      {/* Featured Next Appointment Widget */}
      {nextAppointment && (
        <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-sky-600"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              ⚡ Next Upcoming Appointment
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Queue #: <span className="text-sky-700 font-extrabold">{nextAppointment.queueNumber}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-slate-100 py-4 my-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Doctor</p>
              <p className="text-base font-bold text-slate-800">{nextAppointment.doctorId?.userId?.name || 'Doctor'}</p>
              <p className="text-xs text-slate-500">{nextAppointment.doctorId?.specialization}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Date & Time</p>
              <p className="text-base font-bold text-slate-800">{nextAppointment.appointmentDate}</p>
              <p className="text-xs text-slate-500">{nextAppointment.startTime} - {nextAppointment.endTime}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Current Status</p>
              <p className="text-base font-bold text-slate-800 mt-1">{nextAppointment.status}</p>
              <p className="text-xs text-slate-500">Priority: {nextAppointment.priority}</p>
            </div>
          </div>
        </div>
      )}

      {/* All Appointments List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Your Appointments ({appointments.length})</h3>
          <Link to="/patient/appointments" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
            View All →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments booked yet"
            message="You haven't scheduled any doctor consultations yet. Click below to view available doctors."
            actionText="Find & Book Doctor"
            onAction={() => window.location.href = '/patient/doctors'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.slice(0, 6).map((app) => (
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
    </div>
  );
};

export default PatientDashboard;
