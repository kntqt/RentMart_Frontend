import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import RevenueChart from '../../components/charts/RevenueChart';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3, TrendingUp, Store, DollarSign } from 'lucide-react';

const AdminReports = () => {
  const [data, setData] = useState({
    kpis: { totalCollections: 0, occupancyRate: '0%' },
    revenueChart: []
  });

  useEffect(() => {
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports & Collection Analytics</h1>
          <p className="text-sm text-slate-500 font-medium">Exportable revenue reports and occupancy metrics for Duero Municipal Office.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 text-white space-y-3 shadow-xl shadow-primary-600/20">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-200">Total Lifetime Collections</span>
            <p className="text-3xl font-black">{formatCurrency(data.kpis.totalCollections)}</p>
            <p className="text-xs text-primary-100 font-medium">Verified by municipal staff receipts.</p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Occupancy Rate</span>
            <p className="text-3xl font-black text-sky-400">{data.kpis.occupancyRate}</p>
            <p className="text-xs text-slate-400 font-medium">Active stall leases vs available market space inventory.</p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Revenue Trend (Last 6 Months)</h3>
          </div>
          <RevenueChart data={data.revenueChart} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
