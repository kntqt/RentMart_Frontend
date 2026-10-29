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
    revenueChart: [],
    revenuePerformance: {
      year: [],
      month: [],
      weeks: [],
      days: []
    }
  });
  const [revenuePeriod, setRevenuePeriod] = useState('month');
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

  const revenuePeriods = [
    { key: 'year', label: 'Year', subtitle: 'Yearly market space collections overview' },
    { key: 'month', label: 'Month', subtitle: 'Monthly market space collections overview' },
    { key: 'weeks', label: 'Weeks', subtitle: 'Weekly market space collections overview' },
    { key: 'days', label: 'Days', subtitle: 'Daily market space collections overview' },
  ];

  // Resolve active chart dataset with fallback to legacy revenueChart
  const activeRevenueData =
    data.revenuePerformance?.[revenuePeriod] ||
    data.revenuePerformance?.[revenuePeriod + 's'] ||
    (revenuePeriod === 'month' ? revenueChart : []);

  const currentSubtitle =
    revenuePeriods.find((p) => p.key === revenuePeriod)?.subtitle ||
    'Monthly market space collections overview';

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#241C15]">Revenue Performance</h3>
                <p className="text-xs text-[#241C15]/40">{currentSubtitle}</p>
              </div>

              {/* Timeframe Filter Tabs: Year | Month | Weeks | Days */}
              <div className="inline-flex p-1 bg-[#F6EFDE] rounded-xl border border-[#241C15]/8 self-start sm:self-auto">
                {revenuePeriods.map((p) => {
                  const active = revenuePeriod === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setRevenuePeriod(p.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0F3D37] text-white shadow-xs'
                          : 'text-[#241C15]/60 hover:text-[#241C15] hover:bg-black/5'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <RevenueChart data={activeRevenueData} period={revenuePeriod} />
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
