import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { User, Mail, Phone, MapPin, Lock, Save, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    middle_name: user?.middle_name || '',
    last_name: user?.last_name || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
    gender: user?.gender || 'Male',
    civil_status: user?.civil_status || 'Single'
  });

  const [passData, setPassData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [flash, setFlash] = useState({ type: '', message: '' });
  const [passFlash, setPassFlash] = useState({ type: '', message: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', formData);
      updateUserProfile(formData);
      setFlash({ type: 'success', message: 'Profile details updated successfully.' });
    } catch (error) {
      setFlash({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      setPassFlash({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      await api.put('/auth/password', {
        current_password: passData.current_password,
        new_password: passData.new_password
      });
      setPassFlash({ type: 'success', message: 'Password changed successfully.' });
      setPassData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setPassFlash({ type: 'error', message: error.response?.data?.message || 'Error changing password.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-sm text-slate-500 font-medium">View and manage your account details and security settings.</p>
        </div>

        {/* Profile Details Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-3xl bg-primary-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-primary-500/30">
              {user?.first_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.email} • <span className="uppercase font-bold text-primary-600">{user?.role}</span></p>
            </div>
          </div>

          <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complete Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-slate-400" />
            <span>Security & Password Reset</span>
          </h3>

          <FlashMessage type={passFlash.type} message={passFlash.message} onClose={() => setPassFlash({ type: '', message: '' })} />

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={passData.current_password}
                onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password *</label>
              <input
                type="password"
                required
                value={passData.new_password}
                onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={passData.confirm_password}
                onChange={(e) => setPassData({ ...passData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md hover:bg-slate-800 transition"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
