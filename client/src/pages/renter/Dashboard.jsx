import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { Building2, DollarSign, Calendar, CreditCard, Store } from 'lucide-react';

const RenterDashboard = () => {
  const [data, setData] = useState({
    activeUnits: 0,
    outstandingBalance: 0,
    nextDueDate: 'N/A',
    totalPaid: 0,
    assignedSpaces: [],
    recentPayments: []
  });

  useEffect(() => {
    api.get('/dashboard/renter').then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  const { activeUnits, outstandingBalance, nextDueDate, totalPaid, assignedSpaces, recentPayments } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Renter Portal Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Track your active market stall rentals, balances, and payment history.</p>
        </div>

        {/* 4 Renter KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Units</span>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeUnits}</p>
            <p className="text-xs text-sky-600 font-semibold">Leased Market Stalls</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600">{formatCurrency(outstandingBalance)}</p>
            <p className="text-xs text-rose-600 font-semibold">Remaining Lease Unpaid</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Due Date</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900">{formatDate(nextDueDate)}</p>
            <p className="text-xs text-amber-600 font-semibold">Upcoming Payment Schedule</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount Paid</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-emerald-600 font-semibold">Total Payments Processed</p>
          </div>
        </div>

        {/* Assigned Space Details Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center space-x-2">
            <Store className="w-5 h-5 text-primary-600" />
            <span>My Availed Market Stall</span>
          </h3>

          {assignedSpaces.length === 0 ? (
            <p className="text-sm text-slate-400">You currently do not have any actively leased market stalls.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedSpaces.map((s, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900">{s.space_number}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{s.location}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Size: <strong className="text-slate-800">{s.size_sqm} sqm</strong></span>
                    <span>Rate: <strong className="text-primary-600">{formatCurrency(s.monthly_rate)} / yr</strong></span>
                    <span>Lease Start: <strong className="text-slate-800">{formatDate(s.start_date)}</strong></span>
                    <span>Lease End: <strong className="text-slate-800">{formatDate(s.end_date)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments List */}
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Recent Payment History</h3>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400">No payment transactions found.</p>
            ) : (
              recentPayments.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.space_number} • Ref #{p.reference_number || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{formatDate(p.payment_date)} • {p.payment_type}</p>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(p.amount_paid)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RenterDashboard;
