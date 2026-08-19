import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import RevenueChart from '../../components/charts/RevenueChart';
import { DollarSign, Users, Store, Clock, ArrowUpRight } from 'lucide-react';

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

const monoStyle = { fontFamily: "'IBM Plex Mono', monospace" };
const displayStyle = { fontFamily: "'Archivo Black', sans-serif" };

const AdminDashboard = () => {
  useMarketFonts();
  const [data, setData] = useState({
    kpis: { totalCollections: 0, registeredUsers: 0, occupancyRate: '0%', pendingApprovals: 0 },
    recentActivities: [],
    revenueChart: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const { kpis, recentActivities, revenueChart } = data;

  const kpiCards = [
    {
      label: 'Total Collections',
      value: formatCurrency(kpis.totalCollections),
      icon: DollarSign,
      accent: '#0F3D37',
      note: 'Lifetime revenue recorded',
      noteIcon: true,
    },
    {
      label: 'Registered Users',
      value: kpis.registeredUsers,
      icon: Users,
      accent: '#C1440E',
      note: 'Staff & renter accounts',
    },
    {
      label: 'Occupancy Rate',
      value: kpis.occupancyRate,
      icon: Store,
      accent: '#8a5f1f',
      note: 'Leased market units',
    },
    {
      label: 'Pending Approvals',
      value: kpis.pendingApprovals,
      icon: Clock,
      accent: '#E8A33D',
      note: 'Requires admin review',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Admin Overview</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Real-time KPI metrics and collection analytics for Duero Public Market.</p>
        </div>

        {/* 4 KPI Cards — ticket stub accent on the left edge */}
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

        {/* Revenue Graph & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#241C15]">Revenue Performance</h3>
                <p className="text-xs text-[#241C15]/40">Monthly market space collections overview</p>
              </div>
            </div>
            <RevenueChart data={revenueChart} />
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#241C15]">Recent Transactions</h3>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-[#241C15]/40">No payment transactions recorded yet.</p>
              ) : (
                recentActivities.map((act, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/8">
                    <div>
                      <p className="text-sm font-bold text-[#241C15]">{act.first_name} {act.last_name}</p>
                      <p className="text-xs text-[#241C15]/50 font-medium">{act.space_number || 'Stall'} • {formatDate(act.payment_date)}</p>
                    </div>
                    <span className="text-sm font-bold text-[#0F3D37]" style={monoStyle}>{formatCurrency(act.amount_paid)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;