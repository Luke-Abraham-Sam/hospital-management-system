import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CalendarDays,
  ListOrdered
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/doctors', label: 'Find Doctors', icon: UserCheck },
    { to: '/patient/book', label: 'Book Appointment', icon: Calendar },
    { to: '/patient/appointments', label: 'My Appointments', icon: Clock },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/today', label: "Today's Schedule", icon: CalendarDays },
    { to: '/doctor/queue', label: 'Live Queue', icon: ListOrdered },
    { to: '/doctor/schedule', label: 'Manage Availability', icon: Clock },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
  ];

  let links = [];
  if (role === 'PATIENT') links = patientLinks;
  if (role === 'DOCTOR') links = doctorLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col justify-between h-full">
          <div>
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation ({role})
            </div>
            <nav className="mt-2 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-semibold border-l-4 border-sky-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Secure Session</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Role: <span className="font-bold">{role}</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
