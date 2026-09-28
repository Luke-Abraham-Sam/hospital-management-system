import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PATIENT':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">CarePulse</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hospital & Queue MVP</p>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 pr-3 border-r border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
              <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
            title="Sign out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
