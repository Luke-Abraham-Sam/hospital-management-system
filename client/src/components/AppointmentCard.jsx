import React from 'react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatters';
import { Calendar, Clock, User, AlertCircle, Hash } from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel, onUpdateStatus, userRole }) => {
  const {
    _id,
    appointmentDate,
    startTime,
    endTime,
    reason,
    priority,
    queueNumber,
    status,
    patientId,
    doctorId
  } = appointment;

  const doctorName = doctorId?.userId?.name || doctorId?.name || 'Doctor';
  const specialization = doctorId?.specialization || 'Specialist';
  const patientName = patientId?.name || 'Patient';
  const patientPhone = patientId?.phone || 'No phone';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
              priority === 'URGENT' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {priority === 'URGENT' && <AlertCircle size={12} className="mr-1" />}
              {priority}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-mono text-xs font-bold border border-sky-100">
              <Hash size={12} className="mr-0.5" /> {queueNumber}
            </span>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mt-2">
            {userRole === 'PATIENT' ? doctorName : patientName}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {userRole === 'PATIENT' ? specialization : `Phone: ${patientPhone}`}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
        <div className="flex items-center space-x-1.5">
          <Calendar size={14} className="text-sky-600" />
          <span>{formatDate(appointmentDate)}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock size={14} className="text-sky-600" />
          <span>{startTime} - {endTime}</span>
        </div>
      </div>

      {reason && (
        <p className="text-xs text-slate-500 mb-4 italic">
          "{reason}"
        </p>
      )}

      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
        {userRole === 'PATIENT' && status !== 'CANCELLED' && status !== 'COMPLETED' && (
          <button
            onClick={() => onCancel(_id)}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
          >
            Cancel Appointment
          </button>
        )}

        {(userRole === 'DOCTOR' || userRole === 'ADMIN') && status !== 'CANCELLED' && status !== 'COMPLETED' && (
          <div className="flex items-center space-x-2">
            {status === 'BOOKED' && (
              <button
                onClick={() => onUpdateStatus(_id, 'IN_QUEUE')}
                className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Send to Queue
              </button>
            )}
            {status === 'IN_QUEUE' && (
              <button
                onClick={() => onUpdateStatus(_id, 'IN_PROGRESS')}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Call Patient
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button
                onClick={() => onUpdateStatus(_id, 'COMPLETED')}
                className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
