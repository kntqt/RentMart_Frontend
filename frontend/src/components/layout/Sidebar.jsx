import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  ChevronRight
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

  if (!user) return null;

  const role = user.role;

  const adminMenu = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/admin/profile', icon: User },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Renters', path: '/admin/renters', icon: Users },
    { label: 'Browse Space', path: '/admin/spaces', icon: Store },
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

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#241C15] text-[#FBF6EA] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
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
                  `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
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

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#FBF6EA]/10">
        <button
          onClick={logout}
          className={`w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm text-[#E8A33D] hover:bg-[#E8A33D]/10 hover:text-[#E8A33D] transition ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
