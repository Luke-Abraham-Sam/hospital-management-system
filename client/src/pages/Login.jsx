import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { Activity, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'PATIENT') navigate('/patient/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing demo accounts
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-600 rounded-2xl text-white shadow-lg mb-3">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">CarePulse Healthcare</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your appointment & queue account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl border border-slate-200/80 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Quick Login Helper Box */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('john.doe@example.com', 'patient123')}
                className="py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-medium rounded border border-sky-200 text-center"
              >
                👤 Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('smith@hospital.com', 'doctor123')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium rounded border border-emerald-200 text-center"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@hospital.com', 'admin123')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-medium rounded border border-purple-200 text-center"
              >
                👑 Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Register as a Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
