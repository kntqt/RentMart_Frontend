import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import {
  LayoutDashboard,
  User,
  Users,
  UserPlus,
  Building2,
  Receipt,
  CreditCard,
  BarChart3,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

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

const Sidebar = ({ collapsed, setCollapsed }) => {
  useMarketFonts();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const role = user.role;

  const adminMenu = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Renters', path: '/admin/renters', icon: Users },
    { label: 'Spaces', path: '/admin/spaces', icon: Store },
    { label: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const staffMenu = [
    { label: 'Overview', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/staff/profile', icon: User },
    { label: 'Renters', path: '/staff/renters', icon: Users },
    { label: 'Create Renter', path: '/staff/create-renter', icon: UserPlus },
    { label: 'Browse Space', path: '/staff/spaces', icon: Store },
    { label: 'Payments', path: '/staff/payments', icon: CreditCard },
    { label: 'Billing', path: '/staff/billing', icon: Receipt },
  ];

  const renterMenu = [
    { label: 'Overview', path: '/renter/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/renter/profile', icon: User },
    { label: 'Availed Space', path: '/renter/availed_space', icon: Building2 },
    { label: 'Browse Space', path: '/renter/spaces', icon: Store },
    { label: 'Transactions', path: '/renter/transactions', icon: CreditCard },
  ];

  let menuItems = [];
  if (role === 'admin') menuItems = adminMenu;
  else if (role === 'staff') menuItems = staffMenu;
  else if (role === 'renter') menuItems = renterMenu;

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsLoggingOut(true);

    // 3-second animated loading before logout
    setTimeout(() => {
      logout();
    }, 3000);
  };

  return (
    <>
      {/* 3-Second Fullscreen Loading Screen on Logout */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 bg-[#241C15]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#FBF6EA] rounded-3xl p-8 border-2 border-dashed border-[#C1440E]/40 shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <div className="relative w-24 h-24 mx-auto">
              <img src={logoImg} alt="RentMart" className="w-24 h-24 rounded-full object-cover shadow-xl border-2 border-[#C1440E]" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C1440E] text-white flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                Signing Out...
              </h3>
              <p className="text-xs text-[#241C15]/60 font-medium">
                Ending session for <strong>{user?.first_name} {user?.last_name}</strong>. Clearing workspace and securing your account.
              </p>
            </div>

            {/* 3-Second Animated Progress Bar */}
            <div className="w-full bg-[#241C15]/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E8A33D] to-[#C1440E] rounded-full"
                style={{
                  width: '100%',
                  animation: 'logoutFillProgress 3s linear forwards'
                }}
              />
            </div>
            <p className="text-[11px] text-[#241C15]/40 font-mono">Redirecting to login in 3 seconds...</p>
          </div>

          <style>{`
            @keyframes logoutFillProgress {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#241C15] text-[#FBF6EA] transition-all duration-300 flex flex-col justify-between ${collapsed ? 'w-20' : 'w-64'
          }`}
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        {/* Top Logo Section */}
        <div>
          <div className="flex items-center justify-between h-20 px-6 border-b border-[#FBF6EA]/10">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <img src={logoImg} alt="RentMart Logo" className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-[#C1440E] ring-2 ring-[#C1440E]/20" />
                <div>
                  <h1 className="text-lg leading-tight tracking-tight text-[#FBF6EA]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>RENTMART</h1>
                  <p className="text-[10px] tracking-wider text-[#E8A33D] font-bold uppercase">Market CSS System</p>
                </div>
              </div>
            ) : (
              <img src={logoImg} alt="RentMart Logo" className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-[#C1440E] ring-2 ring-[#C1440E]/20 mx-auto" />
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-xl bg-[#FBF6EA]/8 text-[#FBF6EA]/50 hover:text-[#FBF6EA] hover:bg-[#FBF6EA]/15 transition"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${isActive
                      ? 'bg-[#C1440E] text-[#FBF6EA] shadow-lg shadow-[#C1440E]/30 font-semibold'
                      : 'text-[#FBF6EA]/50 hover:text-[#FBF6EA] hover:bg-[#FBF6EA]/8'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3.5'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout Button */}
        <div className="p-4 border-t border-[#FBF6EA]/10">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm text-[#E8A33D] hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] transition ${collapsed ? 'justify-center' : 'justify-start'
              }`}
            title="Sign Out"
          >
            <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Sign Out"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-center sm:text-left" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C1440E]/12 text-[#C1440E] flex items-center justify-center flex-shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#241C15]">Are you sure you want to sign out?</h4>
              <p className="text-xs text-[#241C15]/60 mt-1 leading-relaxed">
                You will be logged out of your <strong className="uppercase text-[#C1440E]">{user.role}</strong> session ({user.first_name} {user.last_name}) and returned to the sign-in page.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#241C15]/8 hover:bg-[#241C15]/12 text-[#241C15]/70 font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
