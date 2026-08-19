import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { getUserAvatarUrl } from '../../utils/formatters';
import { User, Mail, Phone, MapPin, Lock, Save, ShieldCheck, Camera, Upload, Trash2 } from 'lucide-react';

// Injects the market's type system once, without touching index.html
const useMarketFonts = () => {
  useEffect(() => {
    if (document.getElementById("rentmart-fonts")) return;
    const link = document.createElement("link");
    link.id = "rentmart-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap";
    document.head.appendChild(link);
  }, []);
};

const displayStyle = { fontFamily: "'Archivo Black', sans-serif" };
const inputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";
const labelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1";

const ProfilePage = () => {
  useMarketFonts();
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    middle_name: user?.middle_name || '',
    last_name: user?.last_name || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
    gender: user?.gender || 'Male',
    civil_status: user?.civil_status || 'Single'
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.profile_image ? getUserAvatarUrl(user.profile_image) : null
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const [passData, setPassData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [flash, setFlash] = useState({ type: '', message: '' });
  const [passFlash, setPassFlash] = useState({ type: '', message: '' });

  // Sync avatar preview if user context changes
  useEffect(() => {
    if (user?.profile_image && !avatarFile) {
      setAvatarPreview(getUserAvatarUrl(user.profile_image));
    }
  }, [user?.profile_image]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('middle_name', formData.middle_name || '');
      data.append('last_name', formData.last_name);
      data.append('contact_number', formData.contact_number || '');
      data.append('address', formData.address || '');
      data.append('gender', formData.gender);
      data.append('civil_status', formData.civil_status);

      if (avatarFile) {
        data.append('profile_image', avatarFile);
      }

      const res = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.user) {
        updateUserProfile(res.data.user);
      } else {
        updateUserProfile(formData);
      }

      setAvatarFile(null);
      setFlash({ type: 'success', message: 'Profile details and picture updated successfully.' });
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
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
      <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Account Profile</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Manage your personal details, profile picture, and account security.</p>
        </div>

        {/* Profile Details Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#241C15]/8 pb-6">
            <div className="flex items-center space-x-5">
              {/* Profile Photo Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#C1440E] text-[#FBF6EA] flex items-center justify-center text-3xl font-bold shadow-lg shadow-[#C1440E]/25 border-2 border-[#C1440E] ring-2 ring-[#C1440E]/20" style={displayStyle}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.first_name?.charAt(0) || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-[#241C15] hover:bg-[#C1440E] text-[#FBF6EA] rounded-xl shadow-md transition transform active:scale-95"
                  title="Upload profile picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#241C15]">{user?.first_name} {user?.last_name}</h2>
                <p className="text-xs text-[#241C15]/50 font-medium mt-0.5">{user?.email} • <span className="uppercase font-bold text-[#C1440E]">{user?.role}</span></p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-4 py-2 rounded-xl bg-[#F6EFDE] hover:bg-[#F6EFDE]/80 text-[#241C15] text-xs font-bold border border-[#241C15]/10 flex items-center space-x-2 transition self-start sm:self-auto"
            >
              <Upload className="w-4 h-4 text-[#C1440E]" />
              <span>{avatarPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
            </button>
          </div>

          <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={inputClass + " font-semibold"}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Complete Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={inputClass}
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#241C15] border-b border-[#241C15]/8 pb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-[#0F3D37]" />
            <span>Security & Password Reset</span>
          </h3>

          <FlashMessage type={passFlash.type} message={passFlash.message} onClose={() => setPassFlash({ type: '', message: '' })} />

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className={labelClass}>Current Password *</label>
              <input
                type="password"
                required
                value={passData.current_password}
                onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>New Password *</label>
              <input
                type="password"
                required
                value={passData.new_password}
                onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password *</label>
              <input
                type="password"
                required
                value={passData.confirm_password}
                onChange={(e) => setPassData({ ...passData, confirm_password: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0F3D37] text-[#FBF6EA] font-bold text-sm shadow-md hover:bg-[#0c332e] transition flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;