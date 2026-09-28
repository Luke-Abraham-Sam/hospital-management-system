import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { Search, Stethoscope, Award, Calendar } from 'lucide-react';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('[DoctorList Error]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const departments = ['ALL', ...new Set(doctors.map(d => d.department))];

  const filteredDoctors = doctors.filter(doc => {
    const name = doc.userId?.name || '';
    const spec = doc.specialization || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spec.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  if (loading) return <LoadingSpinner label="Loading hospital doctors directory..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Hospital Medical Staff</h2>
        <p className="text-sm text-slate-500 mt-1">Browse specialist doctors and book your preferred consultation slot</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            {departments.map((dept, i) => (
              <option key={i} value={dept}>
                {dept === 'ALL' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          title="No doctors match your filter"
          message="Try adjusting your search criteria or department filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg mb-3">
                    <Stethoscope size={24} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Fee: {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{doctor.userId?.name || 'Dr. Specialist'}</h3>
                <p className="text-xs font-semibold text-sky-600 mb-1">{doctor.specialization}</p>
                <p className="text-xs text-slate-500 mb-4">{doctor.department}</p>

                <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mb-4">
                  <Award size={14} className="text-amber-500" />
                  <span>{doctor.experience} years clinical experience</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/patient/book?doctorId=${doctor._id}`)}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                <Calendar size={16} className="mr-2" />
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
