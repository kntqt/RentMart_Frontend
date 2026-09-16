import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import { formatCurrency } from '../../utils/formatters';
import {
  Store,
  Clock,
  DollarSign,
  Users,
  ArrowUpRight,
  ShieldAlert,
  Check,
  X,
  CreditCard,
  UserPlus,
  ArrowRight
} from 'lucide-react';

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

const StaffDashboard = () => {
  useMarketFonts();
  const [stats, setStats] = useState({
    availableSpaces: 0,
    rentedSpaces: 0,
    pendingRentals: 0,
    paymentsToday: 0
  });
  const [pendingList, setPendingList] = useState([]);
  const [flash, setFlash] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/dashboard/staff'),
        api.get('/rentals/pending')
      ]);
      setStats(statsRes.data);
      setPendingList(pendingRes.data || []);
    } catch (err) {
      console.error('Error fetching staff dashboard:', err);
    }
  };

  const handleApproveRental = async (rentalId) => {
    try {
      await api.patch(`/rentals/${rentalId}/approve`);
      setFlash({ type: 'success', message: 'Rental request approved! Space is now set to Rented.' });
      fetchDashboardData();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error approving rental.' });
    }
  };

  const handleRejectRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to reject this rental request?')) return;
    try {
      await api.patch(`/rentals/${rentalId}/reject`);
      setFlash({ type: 'success', message: 'Rental request rejected. Space returned to available.' });
      fetchDashboardData();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error rejecting rental.' });
    }
  };

  const kpiCards = [
    { label: 'Available Spaces', value: stats.availableSpaces, icon: Store, accent: '#0F3D37', note: 'Ready for Lease' },
    { label: 'Rented Units', value: stats.rentedSpaces, icon: Users, accent: '#C1440E', note: 'Active Market Vendors' },
    { label: 'Pending Rentals', value: stats.pendingRentals, icon: Clock, accent: '#E8A33D', note: 'Requires Staff Action', noteIcon: true },
    { label: 'Payments Today', value: formatCurrency(stats.paymentsToday), icon: DollarSign, accent: '#8a5f1f', note: 'Collected Today', noteIcon: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Staff Operational Dashboard</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Daily stall operations, lease processing, and market collection management.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((k) => (
            <div
              key={k.label}
              className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
              style={{ borderLeft: `4px solid ${k.accent}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">{k.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.accent + '1A', color: k.accent }}>
                  <k.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>{k.value}</p>
              <p className="text-xs font-semibold flex items-center" style={{ color: k.accent }}>
                {k.noteIcon && <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
                <span>{k.note}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Pending Rental Approvals Task Card */}
        {pendingList.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-[#E8A33D]/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#241C15]/8 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8A33D]/15 text-[#8a5f1f] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-[#C1440E]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#241C15]">Rented Space Approval Tasks ({pendingList.length})</h3>
                  <p className="text-xs text-[#241C15]/50">Action required: Approve or reject stall requests submitted by renters.</p>
                </div>
              </div>
              <Link
                to="/staff/spaces"
                className="text-xs font-bold text-[#C1440E] hover:text-[#a8390c] flex items-center space-x-1 transition"
              >
                <span>View All in Spaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#241C15]/8">
              {pendingList.slice(0, 3).map((pr) => (
                <div key={pr.rental_id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-[#241C15] text-[#FBF6EA] font-black text-xs">
                        {pr.space_number}
                      </span>
                      <p className="text-sm font-bold text-[#241C15]">{pr.first_name} {pr.last_name}</p>
                      <span className="text-xs text-[#241C15]/50">({pr.email})</span>
                    </div>
                    <p className="text-xs text-[#241C15]/60 mt-1">
                      Rate: <strong className="text-[#C1440E]">{formatCurrency(pr.monthly_rate)}/yr</strong> • Requested: {pr.start_date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveRental(pr.rental_id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1 shadow-sm transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectRental(pr.rental_id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1 shadow-sm transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/staff/spaces"
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md hover:border-[#C1440E]/30 transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#C1440E]/10 text-[#C1440E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#241C15] text-base group-hover:text-[#C1440E] transition">Lease Approvals & Spaces</h4>
            <p className="text-xs text-[#241C15]/50 leading-relaxed">Review pending space applications, assign market stalls, and process lease approvals.</p>
          </Link>

          <Link
            to="/staff/payments"
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md hover:border-[#0F3D37]/30 transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D37]/10 text-[#0F3D37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#241C15] text-base group-hover:text-[#0F3D37] transition">Collect Market Payments</h4>
            <p className="text-xs text-[#241C15]/50 leading-relaxed">Record rental and utility payments from vendors and generate official receipts.</p>
          </Link>

          <Link
            to="/staff/create-renter"
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md hover:border-[#E8A33D]/40 transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8A33D]/15 text-[#8a5f1f] flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#241C15] text-base group-hover:text-[#8a5f1f] transition">Register New Renter</h4>
            <p className="text-xs text-[#241C15]/50 leading-relaxed">Create vendor profiles with verified identification and emergency contact info.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
