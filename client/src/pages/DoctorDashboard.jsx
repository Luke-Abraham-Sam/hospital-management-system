import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Users, Clock, CheckCircle, Activity, ListOrdered, Calendar } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTodayQueue = async () => {
    if (!user?.doctorId) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await API.get(`/queue/${user.doctorId}?date=${todayStr}`);
      if (res.data.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      console.error('[DoctorDashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayQueue();
  }, [user]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await API.patch(`/queue/${appointmentId}/status`, { status: newStatus });
      fetchTodayQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner label="Loading doctor dashboard & today's queue..." />;

  const metrics = queueData?.metrics || { totalAppointments: 0, waiting: 0, inProgress: 0, completed: 0 };
  const queueList = queueData?.queue || [];
  const currentlyServing = queueData?.currentlyServing || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}! 🩺</h2>
          <p className="text-sm text-slate-500 mt-0.5">Doctor OPD Consultation & Patient Queue Dashboard</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/doctor/queue"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center"
          >
            <ListOrdered size={16} className="mr-2" />
            Manage Live Queue
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Today Total</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.totalAppointments}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Waiting</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.waiting}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Serving Now</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.inProgress}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Completed</p>
            <h3 className="text-2xl font-bold text-slate-800">{metrics.completed}</h3>
          </div>
        </div>
      </div>

      {/* Currently Serving Banner */}
      {currentlyServing ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-emerald-600 text-white font-mono font-bold rounded-2xl flex items-center justify-center text-lg shadow-sm">
              {currentlyServing.queueNumber}
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                ● Currently In Consultation
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{currentlyServing.patientId?.name}</h3>
              <p className="text-xs text-slate-600">Time: {currentlyServing.startTime} - {currentlyServing.endTime} | Phone: {currentlyServing.patientId?.phone || 'N/A'}</p>
            </div>
          </div>
          <button
            onClick={() => handleStatusUpdate(currentlyServing._id, 'COMPLETED')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Finish & Complete Consultation
          </button>
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500 font-medium">
          No patient is currently in progress. Select a waiting patient from the queue below to start.
        </div>
      )}

      {/* Today's Queue List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Today's Patient Queue ({queueList.length})</h3>

        {queueList.length === 0 ? (
          <EmptyState
            title="No appointments for today"
            message="There are no patients scheduled in your queue for today."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueList.map((app) => (
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
    </div>
  );
};

export default DoctorDashboard;
