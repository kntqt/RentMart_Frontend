import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell } from 'lucide-react';

const Header = ({ collapsed }) => {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    staff: 'bg-amber-50 text-amber-700 border-amber-200',
    renter: 'bg-primary-50 text-primary-700 border-primary-200'
  };

  return (
    <header className={`sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${
      collapsed ? 'pl-24' : 'pl-68'
    } pr-8 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <span className="text-xl font-extrabold text-slate-900 capitalize">
          Welcome back, {user.first_name}!
        </span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${roleColors[user.role] || roleColors.renter} uppercase tracking-wider`}>
          {user.role} Portal
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-2xl hover:bg-slate-100 transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500"></span>
        </button>

        {/* Profile Avatar Card */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {user.first_name ? user.first_name.charAt(0) : <User className="w-5 h-5" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-slate-900 leading-none">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
