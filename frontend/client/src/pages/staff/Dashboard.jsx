import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Store, Clock, DollarSign, Users } from 'lucide-react';

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    availableSpaces: 0,
    rentedSpaces: 0,
    pendingRentals: 0,
    paymentsToday: 0
  });

  useEffect(() => {
    api.get('/dashboard/staff').then(res => setStats(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Operational Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Daily stall operations, lease processing, and market collection management.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Spaces</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.availableSpaces}</p>
            <p className="text-xs text-emerald-600 font-semibold">Ready for Lease Assignment</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rented Units</span>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.rentedSpaces}</p>
            <p className="text-xs text-sky-600 font-semibold">Active Market Vendors</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Rentals</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.pendingRentals}</p>
            <p className="text-xs text-amber-600 font-semibold">Awaiting Admin Sign-off</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payments Today</span>
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.paymentsToday)}</p>
            <p className="text-xs text-primary-600 font-semibold">Collected Today</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
