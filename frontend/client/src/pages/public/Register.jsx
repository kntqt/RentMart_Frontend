import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { User, Mail, Lock, Phone, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';

import logoImg from '../../assets/logo.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    contact_number: '',
    address: '',
    gender: 'Male',
    civil_status: 'Single'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        contact_number: formData.contact_number,
        address: formData.address,
        gender: formData.gender,
        civil_status: formData.civil_status
      });

      setSuccess(res.data.message || 'Registration successful! Your account is pending approval.');
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#192338] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl absolute -top-10 -left-10"></div>
      <div className="w-96 h-96 rounded-full bg-sky-600/10 blur-3xl absolute -bottom-10 -right-10"></div>

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Card */}
        <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <img src={logoImg} alt="RentMart Logo" className="w-20 h-20 rounded-full object-cover mx-auto shadow-2xl border-2 border-emerald-500/40 ring-4 ring-emerald-500/20" />
            <h2 className="text-2xl font-black tracking-tight text-white">Create Renter Account</h2>
            <p className="text-xs text-slate-400 font-medium">Register as a vendor/renter for Duero Public Market commercial spaces</p>
          </div>

          <FlashMessage type="error" message={error} onClose={() => setError('')} />
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{success}</p>
                <p className="text-xs text-emerald-400 mt-1">Redirecting to login page in a few seconds...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Santos"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Dela Cruz"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="09123456789"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Complete Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Poblacion, Duero, Bohol"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-sky-400 text-sm transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Civil Status</label>
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-sky-400 text-sm transition"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-sm transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Registering Account...' : 'Submit Renter Registration'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-400 hover:underline font-bold">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
