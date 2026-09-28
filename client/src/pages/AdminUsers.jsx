import React, { useState, useEffect } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Users, Mail, Phone, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const url = roleFilter === 'ALL' ? '/admin/users' : `/admin/users?role=${roleFilter}`;
        const res = await API.get(url);
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('[AdminUsers Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PATIENT':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <LoadingSpinner label="Fetching registered user directory..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and inspect all system accounts across roles</p>
        </div>

        <div className="w-full md:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">All User Roles</option>
            <option value="PATIENT">Patients Only</option>
            <option value="DOCTOR">Doctors Only</option>
            <option value="ADMIN">Admins Only</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users match filter"
          message="No accounts registered under this role filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Mail size={14} className="text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
