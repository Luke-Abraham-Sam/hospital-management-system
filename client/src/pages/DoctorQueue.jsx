import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';
import { ListOrdered, AlertCircle, Phone, Clock, Play, CheckCircle2 } from 'lucide-react';

const DoctorQueue = () => {
  const { user } = useContext(AuthContext);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchQueue = async () => {
    if (!user?.doctorId) return;
    try {
      setLoading(true);
      const res = await API.get(`/queue/${user.doctorId}?date=${selectedDate}`);
      if (res.data.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      console.error('[DoctorQueue Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user, selectedDate]);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await API.patch(`/queue/${appointmentId}/status`, { status });
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update queue status');
    }
  };

  if (loading) return <LoadingSpinner label="Loading live OPD queue..." />;

  const queue = queueData?.queue || [];
  const metrics = queueData?.metrics || { totalAppointments: 0, waiting: 0, inProgress: 0, completed: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live OPD Queue Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Doctor+Date scoped queue. Urgent patients prioritized automatically.</p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>
      </div>

      {/* Queue Metrics Bar */}
      <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total</p>
          <p className="text-xl font-extrabold text-slate-800">{metrics.totalAppointments}</p>
        </div>
        <div className="border-l border-slate-100">
          <p className="text-[11px] font-bold text-amber-500 uppercase">Waiting</p>
          <p className="text-xl font-extrabold text-amber-600">{metrics.waiting}</p>
        </div>
        <div className="border-l border-slate-100">
          <p className="text-[11px] font-bold text-emerald-500 uppercase">In Progress</p>
          <p className="text-xl font-extrabold text-emerald-600">{metrics.inProgress}</p>
        </div>
        <div className="border-l border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Completed</p>
          <p className="text-xl font-extrabold text-slate-700">{metrics.completed}</p>
        </div>
      </div>

      {/* Queue Table */}
      {queue.length === 0 ? (
        <EmptyState
          title="Queue is empty"
          message={`No active queue records for ${selectedDate}.`}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="py-3.5 px-4">Queue #</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((app) => {
                  const isUrgent = app.priority === 'URGENT';
                  const isInProgress = app.status === 'IN_PROGRESS';

                  return (
                    <tr
                      key={app._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isInProgress ? 'bg-emerald-50/60' : isUrgent ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-sky-700">
                        {app.queueNumber}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-900">{app.patientId?.name || 'Patient'}</p>
                        <p className="text-xs text-slate-400">{app.reason}</p>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {app.startTime} - {app.endTime}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          isUrgent ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isUrgent && <AlertCircle size={12} className="mr-1" />}
                          {app.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {app.status !== 'IN_PROGRESS' && app.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusChange(app._id, 'IN_PROGRESS')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center"
                          >
                            <Play size={12} className="mr-1" /> Start Consultation
                          </button>
                        )}
                        {app.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatusChange(app._id, 'COMPLETED')}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center"
                          >
                            <CheckCircle2 size={12} className="mr-1" /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorQueue;
