import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatarUrl } from '../../utils/formatters';
import { User, Bell } from 'lucide-react';

const Header = ({ collapsed }) => {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors = {
    admin: 'bg-[#C1440E]/10 text-[#C1440E] border-[#C1440E]/25',
    staff: 'bg-[#0F3D37]/10 text-[#0F3D37] border-[#0F3D37]/25',
    renter: 'bg-[#E8A33D]/15 text-[#8a5f1f] border-[#E8A33D]/30'
  };

  const avatarUrl = getUserAvatarUrl(user?.profile_image);

  return (
    <header className={`sticky top-0 z-30 h-20 bg-[#FBF6EA]/90 backdrop-blur-md border-b border-[#241C15]/8 transition-all duration-300 ${
      collapsed ? 'pl-24' : 'pl-68'
    } pr-8 flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <span className="text-xl font-extrabold text-[#241C15] tracking-tight capitalize" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
          Welcome back, {user.first_name}!
        </span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${roleColors[user.role] || roleColors.renter} uppercase tracking-wider`}>
          {user.role} Portal
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="p-2.5 text-[#241C15]/50 hover:text-[#241C15] rounded-xl hover:bg-[#241C15]/5 transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C1440E]"></span>
        </button>

        {/* Profile Avatar Card */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[#241C15]/10">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0F3D37] text-[#FBF6EA] flex items-center justify-center font-bold text-sm shadow-md" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : user.first_name ? (
              user.first_name.charAt(0)
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-[#241C15] leading-none">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-[#241C15]/50 font-medium mt-1">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
