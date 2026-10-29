import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import RevenueChart from '../../components/charts/RevenueChart';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Store, ArrowUpRight } from 'lucide-react';

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

const displayStyle = { fontFamily: "'Archivo Black', sans-serif" };
const monoStyle = { fontFamily: "'IBM Plex Mono', monospace" };

const AdminReports = () => {
  useMarketFonts();
  const [data, setData] = useState({
    kpis: { totalCollections: 0, occupancyRate: '0%' },
    revenueChart: [],
    revenuePerformance: {
      year: [],
      month: [],
      weeks: [],
      days: []
    }
  });
  const [revenuePeriod, setRevenuePeriod] = useState('month');

  useEffect(() => {
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  const revenuePeriods = [
    { key: 'year', label: 'Year', subtitle: 'Yearly market space collections overview' },
    { key: 'month', label: 'Month', subtitle: 'Monthly market space collections overview' },
    { key: 'weeks', label: 'Weeks', subtitle: 'Weekly market space collections overview' },
    { key: 'days', label: 'Days', subtitle: 'Daily market space collections overview' },
  ];

  const activeRevenueData =
    data.revenuePerformance?.[revenuePeriod] ||
    data.revenuePerformance?.[revenuePeriod + 's'] ||
    (revenuePeriod === 'month' ? data.revenueChart : []);

  const currentSubtitle =
    revenuePeriods.find((p) => p.key === revenuePeriod)?.subtitle ||
    'Monthly market space collections overview';

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Reports & Collection Analytics</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Exportable revenue reports and occupancy metrics for Duero Municipal Office.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #0F3D37' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">Total Lifetime Collections</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0F3D37]/10 text-[#0F3D37]">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>{formatCurrency(data.kpis.totalCollections)}</p>
            <p className="text-xs font-semibold text-[#0F3D37] flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Verified by municipal staff receipts</span>
            </p>
          </div>

          <div
            className="p-6 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm hover:shadow-md transition space-y-3"
            style={{ borderLeft: '4px solid #E8A33D' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">Current Occupancy Rate</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E8A33D]/10 text-[#E8A33D]">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>{data.kpis.occupancyRate}</p>
            <p className="text-xs font-semibold text-[#8a5f1f]">
              Active stall leases vs available market space inventory
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
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
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
