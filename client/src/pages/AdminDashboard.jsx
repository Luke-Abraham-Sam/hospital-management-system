import React, { useState, useEffect } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { Users, UserCheck, Calendar, Clock, PlusCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0284c7', '#059669', '#d97706', '#e11d48', '#6b7280'];

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Doctor Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Cardiology',
    department: 'Cardiovascular Health',
    experience: 5,
    consultationFee: 100
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('[AdminDashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setModalError('');

    try {
      const res = await API.post('/admin/doctors', docForm);
      if (res.data.success) {
        setModalOpen(false);
        fetchStats();
        alert('New Doctor account created successfully!');
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create doctor account.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading admin system statistics..." />;

  const stats = statsData?.stats || { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, todayAppointmentsCount: 0 };
  const statusBreakdown = statsData?.statusBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hospital Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-0.5">System overview, metrics analytics, and staff onboarding</p>
        </div>

        <Button variant="primary" onClick={() => setModalOpen(true)} icon={PlusCircle}>
          Register New Doctor
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalPatients}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Doctors</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalDoctors}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Appointments</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalAppointments}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Today's Visits</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.todayAppointmentsCount}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Appointment Status Distribution</h3>
            <p className="text-xs text-slate-500">Live breakdown across all system appointment states</p>
          </div>
          <BarChart2 size={20} className="text-sky-600" />
        </div>

        {statusBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No appointment data available yet to chart.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Hospital Doctor">
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {modalError}
            </div>
          )}

          <FormInput
            label="Doctor Full Name"
            id="name"
            value={docForm.name}
            onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
            placeholder="Dr. Alexander Wright"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              id="email"
              type="email"
              value={docForm.email}
              onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
              placeholder="doctor@hospital.com"
              required
            />
            <FormInput
              label="Password"
              id="password"
              type="password"
              value={docForm.password}
              onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Specialization"
              id="specialization"
              value={docForm.specialization}
              onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
              placeholder="e.g. Cardiology"
              required
            />
            <FormInput
              label="Department"
              id="department"
              value={docForm.department}
              onChange={(e) => setDocForm({ ...docForm, department: e.target.value })}
              placeholder="e.g. Outpatient Care"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Experience (Years)"
              id="experience"
              type="number"
              value={docForm.experience}
              onChange={(e) => setDocForm({ ...docForm, experience: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Consultation Fee ($)"
              id="consultationFee"
              type="number"
              value={docForm.consultationFee}
              onChange={(e) => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createLoading}>
              Create Doctor Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
