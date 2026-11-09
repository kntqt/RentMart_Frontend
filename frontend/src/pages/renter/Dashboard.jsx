import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { Building2, DollarSign, Calendar, CreditCard, Store, ArrowUpRight, CalendarDays, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

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

const statusColors = {
  paid:    { bg: '#0F3D37', text: '#fff', label: 'Paid' },
  unpaid:  { bg: '#E8A33D', text: '#241C15', label: 'Unpaid' },
  overdue: { bg: '#C1440E', text: '#fff', label: 'Overdue' },
};

const MonthStatusBadge = ({ status }) => {
  const s = statusColors[status] || { bg: '#aaa', text: '#fff', label: status };
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: s.bg + '22', color: s.bg, border: `1px solid ${s.bg}44` }}>
      {s.label}
    </span>
  );
};

const RenterDashboard = () => {
  useMarketFonts();
  const [data, setData] = useState({
    activeUnits: 0,
    outstandingBalance: 0,
    totalOverallToPay: 0,
    nextDueDate: 'N/A',
    nextDateToPay: 'N/A',
    totalPaid: 0,
    assignedSpaces: [],
    recentPayments: [],
    monthlySchedule: []
  });

  useEffect(() => {
    api.get('/dashboard/renter').then(res => setData(res.data)).catch(err => console.error(err));
  }, []);

  const {
    activeUnits,
    totalOverallToPay,
    nextDateToPay,
    nextDueDate,
    totalPaid,
    assignedSpaces,
    recentPayments,
    monthlySchedule
  } = data;

  const outstandingToShow = totalOverallToPay ?? data.outstandingBalance ?? 0;
  const nextDue = nextDateToPay || nextDueDate || 'N/A';

  const kpiCards = [
    { label: 'Active Units', value: activeUnits, icon: Building2, accent: '#0F3D37', note: 'Leased Market Stalls' },
    { label: 'Total Outstanding', value: formatCurrency(outstandingToShow), icon: DollarSign, accent: '#C1440E', note: 'Total Monthly Balance Due' },
    { label: 'Next Payment Due', value: formatDate(nextDue), icon: Calendar, accent: '#E8A33D', note: 'Upcoming Monthly Due Date', smallValue: true },
    { label: 'Total Amount Paid', value: formatCurrency(totalPaid), icon: CreditCard, accent: '#8a5f1f', note: 'Total Payments Processed', noteIcon: true },
  ];

  const paidMonths   = (monthlySchedule || []).filter(m => m.status === 'paid').length;
  const unpaidMonths = (monthlySchedule || []).filter(m => m.status === 'unpaid').length;
  const overdueMonths = (monthlySchedule || []).filter(m => m.status === 'overdue').length;

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Renter Portal Overview</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Track your active market stall rentals, monthly billing schedule, and payment history.</p>
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

        {/* Total Overall to Pay Banner */}
        {outstandingToShow > 0 && (
          <div className="p-5 rounded-2xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #C1440E 0%, #8a1e00 100%)' }}>
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Overall to Pay</p>
              <p className="text-3xl font-bold text-white" style={monoStyle}>{formatCurrency(outstandingToShow)}</p>
              {nextDue !== 'N/A' && (
                <p className="text-xs text-white/70 font-medium">Next payment due: <strong className="text-white">{formatDate(nextDue)}</strong></p>
              )}
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white" style={monoStyle}>{overdueMonths}</p>
                <p className="text-xs text-white/60 font-semibold uppercase">Overdue</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white" style={monoStyle}>{unpaidMonths}</p>
                <p className="text-xs text-white/60 font-semibold uppercase">Unpaid</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-2xl font-bold text-white" style={monoStyle}>{paidMonths}</p>
                <p className="text-xs text-white/60 font-semibold uppercase">Paid</p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Payment Schedule */}
        {monthlySchedule && monthlySchedule.length > 0 && (
          <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-5">
            <div className="border-b border-[#241C15]/8 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#241C15] flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-[#C1440E]" />
                <span>1-Year Payment Schedule (12 Monthly Rent Installments)</span>
              </h3>
              <Link
                to="/renter/yearly-lease"
                className="px-4 py-2 rounded-xl bg-[#5340C6]/10 text-[#5340C6] hover:bg-[#5340C6]/20 font-bold text-xs transition inline-flex items-center space-x-1"
              >
                <span>Schedule</span>
                <span>→</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F6EFDE] text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-tl-lg">Month</th>
                    <th className="py-3 px-4">Date to Pay</th>
                    <th className="py-3 px-4">Monthly Amount</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-tr-lg">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241C15]/6">
                  {monthlySchedule.map((m, idx) => (
                    <tr key={m.id || idx} className={`transition ${m.status === 'overdue' ? 'bg-[#C1440E]/4' : m.status === 'paid' ? 'bg-[#0F3D37]/3' : 'hover:bg-[#F6EFDE]/50'}`}>
                      <td className="py-3 px-4 font-bold text-[#241C15]">
                        <div className="flex items-center gap-2">
                          {m.status === 'paid'    && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F3D37]" />}
                          {m.status === 'overdue' && <AlertCircle   className="w-3.5 h-3.5 text-[#C1440E]" />}
                          {m.status === 'unpaid'  && <Clock          className="w-3.5 h-3.5 text-[#E8A33D]" />}
                          {m.month_name || m.billing_month}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#241C15]/70 font-medium" style={monoStyle}>
                        {formatDate(m.date_to_pay || m.due_date)}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#241C15]" style={monoStyle}>
                        {formatCurrency(m.amount_due)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F3D37]" style={monoStyle}>
                        {formatCurrency(m.total_paid_for_month || 0)}
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ ...monoStyle, color: m.balance > 0 ? '#C1440E' : '#0F3D37' }}>
                        {formatCurrency(m.balance || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <MonthStatusBadge status={m.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-[#241C15]/40 font-medium" style={monoStyle}>
                        {m.reference_number || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assigned Space Details Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#241C15] border-b border-[#241C15]/8 pb-4 flex items-center space-x-2">
            <Store className="w-5 h-5 text-[#C1440E]" />
            <span>My Availed Market Stall</span>
          </h3>

          {assignedSpaces.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-[#241C15]/50">You currently do not have any actively leased market stalls.</p>
              <Link
                to="/renter/spaces"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-white font-bold text-xs shadow-sm transition"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Browse Spaces to Rent</span>
              </Link>
            </div>
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
                    <span>Rate: <strong className="text-[#C1440E]" style={monoStyle}>{formatCurrency(s.monthly_rate)} / mo</strong></span>
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
