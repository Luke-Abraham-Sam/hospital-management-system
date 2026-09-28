import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, Check, Save } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ManageSchedule = () => {
  const { user } = useContext(AuthContext);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user?.doctorId) return;
      try {
        const res = await API.get(`/doctors/${user.doctorId}`);
        if (res.data.success) {
          setAvailability(res.data.doctor.availability);
        }
      } catch (err) {
        console.error('[ManageSchedule Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user]);

  const handleToggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        slots: prev[day].available ? [] : [{ startTime: '09:00', endTime: '13:00' }]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await API.put(`/doctors/${user.doctorId}/availability`, { availability });
      if (res.data.success) {
        setMessage('Working schedule saved successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading availability schedule..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Working Schedule</h2>
          <p className="text-sm text-slate-500 mt-0.5">Configure your weekly OPD availability days and consultation hours</p>
        </div>

        <Button variant="primary" loading={saving} onClick={handleSave} icon={Save}>
          Save Schedule
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <Check size={16} />
          <span>{message}</span>
        </div>
      )}

      {availability && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {daysOfWeek.map((day) => {
            const dayConfig = availability[day] || { available: false, slots: [] };

            return (
              <div key={day} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 w-48">
                  <input
                    type="checkbox"
                    id={`toggle-${day}`}
                    checked={dayConfig.available}
                    onChange={() => handleToggleDay(day)}
                    className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500 border-slate-300"
                  />
                  <label htmlFor={`toggle-${day}`} className="text-base font-bold text-slate-800 cursor-pointer">
                    {day}
                  </label>
                </div>

                <div className="flex-1">
                  {dayConfig.available ? (
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-700 bg-sky-50/70 border border-sky-100 px-3 py-2 rounded-xl w-fit">
                      <Clock size={14} className="text-sky-600" />
                      <span>Available Hours: 09:00 - 13:00 & 14:00 - 17:00</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Off / Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageSchedule;
