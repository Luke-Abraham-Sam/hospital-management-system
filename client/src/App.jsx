import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Layouts & Protected Route
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard';
import DoctorList from './pages/DoctorList';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

// Doctor Pages
import DoctorDashboard from './pages/DoctorDashboard';
import TodayAppointments from './pages/TodayAppointments';
import DoctorQueue from './pages/DoctorQueue';
import ManageSchedule from './pages/ManageSchedule';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAppointments from './pages/AdminAppointments';

const App = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  // Root redirect helper
  const getRootRedirect = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={getRootRedirect()} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Patient Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/doctors" element={<DoctorList />} />
          <Route path="/patient/book" element={<BookAppointment />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
        </Route>
      </Route>

      {/* Protected Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/today" element={<TodayAppointments />} />
          <Route path="/doctor/queue" element={<DoctorQueue />} />
          <Route path="/doctor/schedule" element={<ManageSchedule />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
