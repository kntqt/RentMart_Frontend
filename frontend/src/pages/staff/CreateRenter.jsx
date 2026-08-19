import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { UserPlus, RefreshCw, CheckCircle2, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

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
const monoStyle = { fontFamily: "'IBM Plex Mono', monospace" };
const inputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";
const labelClass = "block text-xs font-bold text-[#241C15]/50 uppercase tracking-wider mb-2";

const StaffCreateRenter = () => {
  useMarketFonts();
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
    const cleanFirst = formData.first_name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const cleanLast = formData.last_name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const autoEmail = `${cleanFirst}${cleanLast}@gmail.com`;
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
        <div className="max-w-4xl space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Create Renter Account</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Register a new vendor/renter account. Accounts created by staff require Admin approval before activation.</p>
          </div>

          <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

          {createdUser && (
            <div className="p-6 rounded-2xl bg-[#E8A33D]/8 border border-[#E8A33D]/30 text-[#241C15] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#8a5f1f] font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#E8A33D]" />
                  <span>Renter Account Submitted for Admin Approval</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#E8A33D]/15 border border-[#E8A33D]/35 text-[#8a5f1f] text-xs font-bold uppercase tracking-wider">
                  Pending Admin Approval
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#241C15]/8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-medium">
                <div>
                  <span className="text-xs text-[#241C15]/40 font-bold uppercase block">Renter Name</span>
                  <span className="text-[#241C15] font-bold">{createdUser.name}</span>
                </div>
                <div>
                  <span className="text-xs text-[#241C15]/40 font-bold uppercase block">Login Email</span>
                  <span className="text-[#241C15] font-bold">{createdUser.email}</span>
                </div>
                <div>
                  <span className="text-xs text-[#241C15]/40 font-bold uppercase block">Generated Password</span>
                  <span className="text-[#C1440E] font-bold" style={monoStyle}>{createdUser.password}</span>
                </div>
              </div>
            </div>
          )}

        <div className="bg-white rounded-2xl p-8 border border-[#241C15]/8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/30" />
                  <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} onBlur={handleAutoFill} placeholder="Juan" className={"pl-10 pr-4 " + inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Santos" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} onBlur={handleAutoFill} placeholder="Dela Cruz" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#241C15]/50 uppercase tracking-wider">Email Address</label>
                  <button type="button" onClick={handleAutoFill} className="text-[11px] font-bold text-[#C1440E] hover:underline flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1" /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/30" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juandelacruz@duero.com" className={"pl-10 pr-4 " + inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/30" />
                  <input type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Juan1234" className={"pl-10 pr-4 " + inputClass} style={monoStyle} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/30" />
                  <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="09123456789" className={"pl-10 pr-4 " + inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass + " font-semibold"}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Civil Status</label>
                <select name="civil_status" value={formData.civil_status} onChange={handleChange} className={inputClass + " font-semibold"}>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Complete Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/30" />
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Poblacion, Duero, Bohol" className={"pl-10 pr-4 " + inputClass} />
              </div>
            </div>

            <div className="pt-4 border-t border-[#241C15]/8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center space-x-2 transition disabled:opacity-50"
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
