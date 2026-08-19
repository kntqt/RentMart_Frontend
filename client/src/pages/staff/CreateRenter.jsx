import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { UserPlus, RefreshCw, CheckCircle2, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

const StaffCreateRenter = () => {
  const [formData, setFormData] = useState({
    role: 'renter',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    contact_number: '',
    address: '',
    gender: 'Male',
    civil_status: 'Single'
  });

  const [flash, setFlash] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const handleAutoFill = () => {
    if (!formData.first_name || !formData.last_name) return;
    const autoEmail = `${formData.first_name.toLowerCase().trim()}${formData.last_name.toLowerCase().trim()}@duero.com`;
    const autoPassword = `${formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1)}1234`;
    setFormData(prev => ({ ...prev, email: autoEmail, password: autoPassword }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlash({ type: '', message: '' });
    setCreatedUser(null);
    setLoading(true);

      try {
        const res = await api.post('/users', formData);
        setFlash({ type: 'success', message: res.data.message || 'Renter account created! Pending approval by admin.' });
        setCreatedUser({
          name: `${formData.first_name} ${formData.last_name}`,
          email: res.data.email || formData.email,
          password: res.data.password_plain || formData.password,
          approvalStatus: res.data.approval_status || 'pending'
        });
        // reset form
        setFormData({
          role: 'renter',
          first_name: '',
          middle_name: '',
          last_name: '',
          email: '',
          password: '',
          contact_number: '',
          address: '',
          gender: 'Male',
          civil_status: 'Single'
        });
      } catch (error) {
        setFlash({ type: 'error', message: error.response?.data?.message || 'Failed to create renter account.' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <DashboardLayout>
        <div className="max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Renter Account</h1>
            <p className="text-sm text-slate-500 font-medium">Register a new vendor/renter account. Accounts created by staff require Admin approval before activation.</p>
          </div>

          <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

          {createdUser && (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  <span>Renter Account Submitted for Admin Approval</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  Pending Admin Approval
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Renter Name</span>
                  <span className="text-slate-900 font-bold">{createdUser.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Login Email</span>
                  <span className="text-slate-900 font-bold">{createdUser.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Generated Password</span>
                  <span className="font-mono text-primary-600 font-bold">{createdUser.password}</span>
                </div>
              </div>
            </div>
          )}

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleAutoFill}
                    placeholder="Juan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Santos"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleAutoFill}
                  placeholder="Dela Cruz"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <button type="button" onClick={handleAutoFill} className="text-[11px] font-bold text-primary-600 hover:underline flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juandelacruz@duero.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Juan1234"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="09123456789"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Civil Status</label>
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complete Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Poblacion, Duero, Bohol"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Creating Renter Account...' : 'Create Renter Account'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffCreateRenter;
