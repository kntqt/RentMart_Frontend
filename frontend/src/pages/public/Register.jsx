import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { User, Mail, Phone, MapPin, ArrowLeft, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

import logoImg from '../../assets/logo.jpg';

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

const inputClass =
  "w-full pl-10 pr-3 py-2.5 rounded-lg bg-[#F6EFDE] border-2 border-[#241C15]/15 text-[#241C15] placeholder-[#241C15]/35 focus:outline-none focus:border-[#C1440E] text-sm transition";
const inputClassNoIcon =
  "w-full px-3 py-2.5 rounded-lg bg-[#F6EFDE] border-2 border-[#241C15]/15 text-[#241C15] placeholder-[#241C15]/35 focus:outline-none focus:border-[#C1440E] text-sm transition";
const labelClass = "block text-xs font-bold text-[#241C15]/60 uppercase tracking-wider mb-1.5";

const Register = () => {
  useMarketFonts();
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    address: '',
    gender: 'Male',
    civil_status: 'Single'
  });

  const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Helper to generate a clean Gmail address based on client name
  const generateGmail = (first, last) => {
    if (!first && !last) return '';
    const cleanFirst = (first || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = (last || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanFirst}${cleanLast}@gmail.com`;
  };

  const handleAutoGenerateGmail = () => {
    const generated = generateGmail(formData.first_name, formData.last_name);
    if (generated) {
      setFormData(prev => ({ ...prev, email: generated }));
      setIsEmailManuallyEdited(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setIsEmailManuallyEdited(true);
      setFormData(prev => ({ ...prev, email: value }));
    } else {
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        // Auto-generate email automatically if the user has not typed a custom email yet
        if (!isEmailManuallyEdited && (name === 'first_name' || name === 'last_name')) {
          next.email = generateGmail(next.first_name, next.last_name);
        }
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        contact_number: formData.contact_number,
        address: formData.address,
        gender: formData.gender,
        civil_status: formData.civil_status
      });

      setSuccess(res.data.message || 'Registration submitted! Your account is pending approval. The administrator will create your login credentials.');
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
    <div className="min-h-screen bg-[#0F3D37] text-[#241C15] flex items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Awning stripe accents in the corners */}
      <div
        aria-hidden="true"
        className="w-72 h-72 absolute -top-16 -left-16 opacity-20 rotate-12"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C1440E 0, #C1440E 18px, transparent 18px, transparent 36px, #E8A33D 36px, #E8A33D 54px, transparent 54px, transparent 72px)" }}
      />
      <div
        aria-hidden="true"
        className="w-72 h-72 absolute -bottom-16 -right-16 opacity-20 rotate-12"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C1440E 0, #C1440E 18px, transparent 18px, transparent 36px, #E8A33D 36px, #E8A33D 54px, transparent 54px, transparent 72px)" }}
      />

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-[#FBF6EA]/60 hover:text-[#E8A33D] transition space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Card — styled as an oversized registration ticket */}
        <div className="relative bg-[#FBF6EA] rounded-[1.75rem] p-8 border-2 border-dashed border-[#C1440E]/40 shadow-2xl space-y-6">
          <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F3D37]" />
          <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F3D37]" />

          <div className="text-center space-y-3">
            <img src={logoImg} alt="RentMart Logo" className="w-20 h-20 rounded-full object-cover mx-auto shadow-xl border-2 border-[#C1440E]" />
            <h2 className="text-2xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Create Renter Account</h2>
            <p className="text-xs text-[#241C15]/60 font-medium">Register as a vendor/renter for Duero Public Market commercial spaces</p>
            <p className="text-[11px] text-[#C1440E] font-semibold">Your login credentials will be created by the administrator upon approval.</p>
          </div>

          <FlashMessage type="error" message={error} onClose={() => setError('')} />
          {success && (
            <div className="p-4 rounded-xl bg-[#0F3D37]/8 border-2 border-[#0F3D37]/30 text-[#0F3D37] text-sm flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{success}</p>
                <p className="text-xs text-[#0F3D37]/70 mt-1">Redirecting to login page in a few seconds...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/40" />
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleAutoGenerateGmail}
                    placeholder="Juan"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Santos"
                  className={inputClassNoIcon}
                />
              </div>

              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleAutoGenerateGmail}
                  placeholder="Dela Cruz"
                  className={inputClassNoIcon}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#241C15]/60 uppercase tracking-wider">Email Address (Gmail) *</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateGmail}
                    className="text-[11px] font-bold text-[#C1440E] hover:text-[#a8390c] hover:underline flex items-center space-x-1"
                    title="Generate Gmail based on your name"
                  >
                    <Sparkles className="w-3 h-3 text-[#E8A33D]" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/40" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juandelacruz@gmail.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/40" />
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="09123456789"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Complete Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#241C15]/40" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Poblacion, Duero, Bohol"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClassNoIcon}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Civil Status</label>
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  className={inputClassNoIcon}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-xl shadow-[#C1440E]/25 transition transform active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Submitting Registration...' : 'Submit Renter Registration'}
            </button>
          </form>

          <div className="pt-4 border-t-2 border-dashed border-[#C1440E]/20 text-center">
            <p className="text-xs text-[#241C15]/60">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0F3D37] hover:underline font-bold">
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