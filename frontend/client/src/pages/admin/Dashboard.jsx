import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import RevenueChart from '../../components/charts/RevenueChart';
import { DollarSign, Users, Store, Clock, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time KPI metrics and collection analytics for Duero Public Market.</p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collections</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(kpis.totalCollections)}</p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              <span>Lifetime Revenue Recorded</span>
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{kpis.registeredUsers}</p>
            <p className="text-xs text-slate-400 font-medium">Staff & Renter Accounts</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{kpis.occupancyRate}</p>
            <p className="text-xs text-sky-600 font-semibold">Leased Market Units</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{kpis.pendingApprovals}</p>
            <p className="text-xs text-amber-600 font-semibold">Requires Admin Review</p>
          </div>
        </div>

        {/* Revenue Graph & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
                <p className="text-xs text-slate-400">Monthly market space collections overview</p>
              </div>
            </div>
            <RevenueChart data={revenueChart} />
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-slate-400">No payment transactions recorded yet.</p>
              ) : (
                recentActivities.map((act, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{act.first_name} {act.last_name}</p>
                      <p className="text-xs text-slate-500 font-medium">{act.space_number || 'Stall'} • {formatDate(act.payment_date)}</p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(act.amount_paid)}</span>
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
