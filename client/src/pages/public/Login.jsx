import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FlashMessage from '../../components/ui/FlashMessage';
import { Lock, Mail, Store, ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else if (user.role === 'renter') navigate('/renter/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@duero.com');
      setPassword('Admin1234');
    } else if (role === 'staff') {
      setEmail('staff@duero.com');
      setPassword('Staff1234');
    } else if (role === 'renter') {
      setEmail('juandelacruz@duero.com');
      setPassword('Juan1234');
    }
  };

  return (
    <div className="min-h-screen bg-[#192338] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="w-96 h-96 rounded-full bg-sky-500/10 blur-3xl absolute -top-10 -left-10"></div>
      <div className="w-96 h-96 rounded-full bg-primary-600/10 blur-3xl absolute -bottom-10 -right-10"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Card */}
        <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-primary-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">RENTMART</h2>
            <p className="text-xs text-slate-400 font-medium">Commercial Spaces Services Portal</p>
          </div>

          <FlashMessage type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@duero.com"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-primary-600 hover:from-sky-400 hover:to-primary-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Fill Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Quick Demo Login Selector</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('renter')}
                className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition"
              >
                Renter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
