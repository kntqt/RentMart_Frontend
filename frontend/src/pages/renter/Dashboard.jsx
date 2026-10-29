import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { Building2, DollarSign, Calendar, CreditCard, Store, ArrowUpRight } from 'lucide-react';

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

const RenterDashboard = () => {
  useMarketFonts();
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

  const kpiCards = [
    { label: 'Active Units', value: activeUnits, icon: Building2, accent: '#0F3D37', note: 'Leased Market Stalls' },
    { label: 'Outstanding Balance', value: formatCurrency(outstandingBalance), icon: DollarSign, accent: '#C1440E', note: 'Remaining Lease Unpaid' },
    { label: 'Next Due Date', value: formatDate(nextDueDate), icon: Calendar, accent: '#E8A33D', note: 'Upcoming Payment Schedule', smallValue: true },
    { label: 'Total Amount Paid', value: formatCurrency(totalPaid), icon: CreditCard, accent: '#8a5f1f', note: 'Total Payments Processed', noteIcon: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Renter Portal Overview</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Track your active market stall rentals, balances, and payment history.</p>
        </div>

        {/* 4 Renter KPI Cards */}
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
              <p className={`${k.smallValue ? 'text-lg' : 'text-2xl'} font-bold text-[#241C15]`} style={monoStyle}>{k.value}</p>
              <p className="text-xs font-semibold flex items-center" style={{ color: k.accent }}>
                {k.noteIcon && <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
                <span>{k.note}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Assigned Space Details Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#241C15] border-b border-[#241C15]/8 pb-4 flex items-center space-x-2">
            <Store className="w-5 h-5 text-[#C1440E]" />
            <span>My Availed Market Stall</span>
          </h3>

          {assignedSpaces.length === 0 ? (
            <p className="text-sm text-[#241C15]/40">You currently do not have any actively leased market stalls.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedSpaces.map((s, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-[#F6EFDE] border border-[#241C15]/8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#241C15]" style={displayStyle}>{s.space_number}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-sm font-bold text-[#241C15]/70">{s.location}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#241C15]/50 pt-2 border-t-2 border-dashed border-[#C1440E]/20">
                    <span>Size: <strong className="text-[#241C15]">{s.size_sqm} sqm</strong></span>
                    <span>Rate: <strong className="text-[#C1440E]" style={monoStyle}>{formatCurrency(s.monthly_rate)} / yr</strong></span>
                    <span>Lease Start: <strong className="text-[#241C15]">{formatDate(s.start_date)}</strong></span>
                    <span>Lease End: <strong className="text-[#241C15]">{formatDate(s.end_date)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments List */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#241C15] border-b border-[#241C15]/8 pb-4">Recent Payment History</h3>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-[#241C15]/40">No payment transactions found.</p>
            ) : (
              recentPayments.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/8">
                  <div>
                    <p className="text-sm font-bold text-[#241C15]">{p.space_number} • Ref #{p.reference_number || 'N/A'}</p>
                    <p className="text-xs text-[#241C15]/50 font-medium">{formatDate(p.payment_date)} • {p.payment_type}</p>
                  </div>
                  <span className="text-sm font-bold text-[#0F3D37]" style={monoStyle}>{formatCurrency(p.amount_paid)}</span>
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
