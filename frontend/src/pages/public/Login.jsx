import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FlashMessage from '../../components/ui/FlashMessage';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';

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
  "w-full pl-12 pr-4 py-3 rounded-xl bg-[#F6EFDE] border-2 border-[#241C15]/15 text-[#241C15] placeholder-[#241C15]/35 focus:outline-none focus:border-[#C1440E] text-sm transition";
const labelClass = "block text-xs font-bold text-[#241C15]/60 uppercase tracking-wider mb-2";

const Login = () => {
  useMarketFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectUser, setRedirectUser] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      setRedirectUser(user);
      setIsRedirecting(true);

      // 3-second loading transition before redirecting
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'staff') navigate('/staff/dashboard');
        else if (user.role === 'renter') navigate('/renter/dashboard');
        else navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or inactive account.');
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
    <div className="min-h-screen bg-[#0F3D37] text-[#241C15] flex items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* 3-Second Fullscreen Loading Screen on Sign In */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 bg-[#0F3D37]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#FBF6EA] rounded-3xl p-8 border-2 border-dashed border-[#C1440E]/40 shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative w-24 h-24 mx-auto">
              <img src={logoImg} alt="RentMart" className="w-24 h-24 rounded-full object-cover shadow-xl border-2 border-[#C1440E]" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C1440E] text-white flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                Signing In...
              </h3>
              <p className="text-xs text-[#241C15]/60 font-medium">
                Welcome back, <strong>{redirectUser?.first_name}</strong>! Preparing your <span className="uppercase text-[#C1440E] font-bold">{redirectUser?.role}</span> workspace.
              </p>
            </div>

            {/* 3-Second Animated Progress Bar */}
            <div className="w-full bg-[#241C15]/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8A33D] to-[#C1440E] rounded-full"
                style={{
                  width: '100%',
                  animation: 'fillProgress 3s linear forwards'
                }}
              />
            </div>
            <p className="text-[11px] text-[#241C15]/40 font-mono">Redirecting in 3 seconds...</p>
          </div>
        </div>
      )}

      {/* Awning stripe accents in the corners */}
      <div
        aria-hidden="true"
        className="w-96 h-96 absolute -top-16 -left-16 opacity-20 rotate-12"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C1440E 0, #C1440E 18px, transparent 18px, transparent 36px, #E8A33D 36px, #E8A33D 54px, transparent 54px, transparent 72px)" }}
      />
      <div
        aria-hidden="true"
        className="w-96 h-96 absolute -bottom-16 -right-16 opacity-20 rotate-12"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C1440E 0, #C1440E 18px, transparent 18px, transparent 36px, #E8A33D 36px, #E8A33D 54px, transparent 54px, transparent 72px)" }}
      />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-[#FBF6EA]/60 hover:text-[#E8A33D] transition space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>

        {/* Card — styled as an entry ticket */}
        <div className="relative bg-[#FBF6EA] rounded-[1.75rem] p-8 border-2 border-dashed border-[#C1440E]/40 shadow-2xl space-y-6">
          <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F3D37]" />
          <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#0F3D37]" />

          <div className="text-center space-y-3">
            <img src={logoImg} alt="RentMart Logo" className="w-20 h-20 rounded-full object-cover mx-auto shadow-xl border-2 border-[#C1440E]" />
            <h2 className="text-2xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>RENTMART</h2>
            <p className="text-xs text-[#241C15]/60 font-medium">Commercial Spaces Services Portal</p>
          </div>

          <FlashMessage type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-[#241C15]/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@duero.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-[#241C15]/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isRedirecting}
              className="w-full py-3.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-xl shadow-[#C1440E]/25 transition transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-xs text-[#241C15]/60">
              Don't have a renter account?{' '}
              <Link to="/register" className="text-[#0F3D37] hover:underline font-bold">
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick Demo Fill Accounts */}
          <div className="pt-4 border-t-2 border-dashed border-[#C1440E]/20 space-y-3">
            <p className="text-[11px] font-bold text-[#241C15]/50 uppercase tracking-wider text-center">Quick Demo Login Selector</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-3 py-2 rounded-lg bg-[#C1440E]/8 hover:bg-[#C1440E]/15 text-[#C1440E] border-2 border-[#C1440E]/25 text-xs font-bold transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('staff')}
                className="px-3 py-2 rounded-lg bg-[#E8A33D]/12 hover:bg-[#E8A33D]/20 text-[#8a5f1f] border-2 border-[#E8A33D]/35 text-xs font-bold transition"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('renter')}
                className="px-3 py-2 rounded-lg bg-[#0F3D37]/8 hover:bg-[#0F3D37]/15 text-[#0F3D37] border-2 border-[#0F3D37]/25 text-xs font-bold transition"
              >
                Renter
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Login;