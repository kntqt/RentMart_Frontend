import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Store, Clock, DollarSign, Users, ArrowUpRight } from 'lucide-react';

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

  useEffect(() => {
    api.get('/dashboard/staff').then(res => setStats(res.data)).catch(err => console.error(err));
  }, []);

  const kpiCards = [
    { label: 'Available Spaces', value: stats.availableSpaces, icon: Store, accent: '#0F3D37', note: 'Ready for Lease Assignment' },
    { label: 'Rented Units', value: stats.rentedSpaces, icon: Users, accent: '#C1440E', note: 'Active Market Vendors' },
    { label: 'Pending Rentals', value: stats.pendingRentals, icon: Clock, accent: '#E8A33D', note: 'Awaiting Admin Sign-off' },
    { label: 'Payments Today', value: formatCurrency(stats.paymentsToday), icon: DollarSign, accent: '#8a5f1f', note: 'Collected Today', noteIcon: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Staff Operational Dashboard</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Daily stall operations, lease processing, and market collection management.</p>
        </div>

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
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
