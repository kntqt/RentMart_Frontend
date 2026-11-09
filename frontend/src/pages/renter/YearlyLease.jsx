import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CalendarDays,
  Store,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// Real Database-driven 12-Month Schedule Generator
const buildRealSchedule = (startDateStr, defaultRate = 2500, apiSchedule = []) => {
  if (apiSchedule && apiSchedule.length > 0) {
    const mapped = apiSchedule.map((b, idx) => {
      const d = new Date(b.date_to_pay || b.due_date);
      const formatted = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : (b.date_to_pay || b.due_date);
      const isPaid = b.status === 'paid' || parseFloat(b.balance) <= 0;
      const amt = parseFloat(b.amount_due) || defaultRate;
      const bal = isPaid ? 0 : parseFloat(b.balance || amt);

      return {
        id: b.id || idx + 1,
        billing_id: b.id,
        month_name: formatted,
        full_month: b.month_name || `Month ${idx + 1}`,
        amount: amt,
        balance: bal,
        status: isPaid ? 'paid' : (b.status === 'overdue' ? 'overdue' : 'unpaid'),
        ref: b.reference_number || (isPaid ? `OR-2026-${String(101 + idx)}` : '—'),
        method: b.payment_method || 'GCash',
        date_paid: isPaid ? (b.last_payment_date ? new Date(b.last_payment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : formatted) : null
      };
    });

    // If less than 12 months, complete the remaining months of the year
    if (mapped.length < 12) {
      const base = startDateStr ? new Date(startDateStr) : new Date();
      const validBase = !isNaN(base.getTime()) ? base : new Date();
      const startDay = validBase.getDate();
      for (let i = mapped.length; i < 12; i++) {
        const cur = new Date(validBase.getFullYear(), validBase.getMonth() + i, 1);
        const maxDays = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
        cur.setDate(Math.min(startDay, maxDays));
        const formatted = cur.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const fullMonthName = cur.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        mapped.push({
          id: 1000 + i,
          month_name: formatted,
          full_month: fullMonthName,
          amount: defaultRate,
          balance: defaultRate,
          status: 'unpaid',
          ref: '—',
          method: 'GCash',
          date_paid: null
        });
      }
    }
    return mapped;
  }

  if (!startDateStr) return [];

  // Fallback when no database schedule exists yet
  const base = new Date(startDateStr);
  const validBase = !isNaN(base.getTime()) ? base : new Date();
  const startDay = validBase.getDate();

  return Array.from({ length: 12 }, (_, i) => {
    const cur = new Date(validBase.getFullYear(), validBase.getMonth() + i, 1);
    const maxDays = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    cur.setDate(Math.min(startDay, maxDays));
    const formatted = cur.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const fullMonthName = cur.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return {
      id: i + 1,
      month_name: formatted,
      full_month: fullMonthName,
      amount: defaultRate,
      balance: defaultRate,
      status: 'unpaid',
      ref: '—',
      method: 'GCash',
      date_paid: null
    };
  });
};

const RenterYearlyLease = () => {
  useMarketFonts();
  const [activeTab, setActiveTab] = useState('schedule');
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [stallInfo, setStallInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/renter').then(res => {
      const d = res.data;
      if (d.assignedSpaces && d.assignedSpaces.length > 0) {
        const sp = d.assignedSpaces[0];
        const initialStart = sp.start_date || new Date().toISOString().split('T')[0];
        const rawRate = parseFloat(sp.monthly_rate) || 2500;
        const totalSpaceAmount = parseFloat(sp.space_amount) || (rawRate >= 10000 ? rawRate : rawRate * 12);
        const rate = Math.round((totalSpaceAmount / 12) * 100) / 100;

        setStallInfo({
          space_number: sp.space_number || 'Stall',
          location: sp.location || 'Commercial Stall',
          size_sqm: sp.size_sqm || 20,
          space_amount: totalSpaceAmount,
          monthly_rate: rate,
          start_date: initialStart
        });
        setStartDate(initialStart);

        const generated = buildRealSchedule(initialStart, rate, d.monthlySchedule);
        setSchedule(generated);
      } else {
        setStallInfo(null);
        setSchedule([]);
      }
    }).catch(err => {
      console.warn('Dashboard fetch error:', err);
      setStallInfo(null);
      setSchedule([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleStartDateChange = (newDateStr) => {
    setStartDate(newDateStr);
    if (stallInfo) {
      const updated = buildRealSchedule(newDateStr, stallInfo.monthly_rate, schedule);
      setSchedule(updated);
    }
  };

  const totalPaidCount = schedule.filter(m => m.status === 'paid').length;
  const totalMonthsCount = schedule.length || 12;
  const totalPaidAmount = schedule.filter(m => m.status === 'paid').reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const totalRemainingAmount = schedule.filter(m => m.status !== 'paid').reduce((sum, m) => sum + (parseFloat(m.balance ?? m.amount) || 0), 0);

  const startFormatted = startDate ? new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) : 'Today';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-12" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        
        {/* Empty State: If user has no active stall */}
        {!loading && !stallInfo ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#241C15]/8 shadow-sm space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#5340C6]/10 text-[#5340C6] flex items-center justify-center">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#241C15]" style={displayStyle}>No Active 1-Year Payment Schedule</h2>
              <p className="text-sm text-[#241C15]/60 max-w-md mx-auto">
                You do not currently have an active market stall rental. Browse available spaces in Duero Public Market and submit a reservation to start your 1-year (12-month) lease schedule starting today.
              </p>
            </div>
            <div>
              <Link
                to="/renter/spaces"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Browse Spaces to Rent</span>
              </Link>
            </div>
          </div>
        ) : (
          stallInfo && (
            <>
              {/* Top Navigation Bar with Back & Tabs */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#241C15]/8 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Link
                    to="/renter/availed_space"
                    className="inline-flex items-center text-xs font-bold text-[#241C15]/60 hover:text-[#C1440E] transition"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span>Back to Availed Space</span>
                  </Link>

                  <span className="px-3 py-1 rounded-full bg-[#0F3D37]/10 text-[#0F3D37] text-xs font-bold flex items-center gap-1.5 border border-[#0F3D37]/20">
                    <Store className="w-3.5 h-3.5 text-[#0F3D37]" />
                    <span>Stall {stallInfo.space_number} (1 Year)</span>
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>
                    1-Year Payment Schedule
                  </h1>
                  <p className="text-xs text-[#241C15]/60 mt-0.5 font-medium">
                    Space Amount: <strong className="text-[#5340C6]">{formatCurrency(stallInfo.space_amount)}</strong> • Monthly: <strong className="text-[#0F3D37]">{formatCurrency(stallInfo.monthly_rate)} / month</strong> (÷ 12) across 12 months
                  </p>
                </div>

                {/* Reservation Start Date Selector / Quick Info */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#5340C6]/10 text-[#5340C6] flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#241C15]/40 block">Start of Pay / Rental Date</span>
                      <span className="text-xs font-bold text-[#241C15]">Starts: {startFormatted} (Pay on the {new Date(startDate).getDate()}{[null,'st','nd','rd'][new Date(startDate).getDate()] || 'th'} each month)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] font-bold text-[#241C15]/50 uppercase">Change Start:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-[#241C15] focus:outline-none focus:border-[#5340C6]"
                    />
                  </div>
                </div>

                {/* Tabs: Schedule | Transactions | Documents */}
                <div className="flex border-b border-[#241C15]/10 pt-2">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 pb-3 text-center text-sm font-bold transition relative cursor-pointer ${
                      activeTab === 'schedule'
                        ? 'text-[#5340C6] font-bold'
                        : 'text-[#241C15]/50 hover:text-[#241C15]'
                    }`}
                  >
                    <span>Schedule</span>
                    {activeTab === 'schedule' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5340C6] rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 pb-3 text-center text-sm font-bold transition relative cursor-pointer ${
                      activeTab === 'transactions'
                        ? 'text-[#5340C6] font-bold'
                        : 'text-[#241C15]/50 hover:text-[#241C15]'
                    }`}
                  >
                    <span>Transactions</span>
                    {activeTab === 'transactions' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5340C6] rounded-full" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex-1 pb-3 text-center text-sm font-bold transition relative cursor-pointer ${
                      activeTab === 'documents'
                        ? 'text-[#5340C6] font-bold'
                        : 'text-[#241C15]/50 hover:text-[#241C15]'
                    }`}
                  >
                    <span>Documents</span>
                    {activeTab === 'documents' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5340C6] rounded-full" />
                    )}
                  </button>
                </div>

                {/* Paid: X / 12 Progress Header */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-sm font-bold text-[#241C15]">
                    Paid: <strong className="text-[#0F3D37] text-base" style={monoStyle}>{totalPaidCount} / {totalMonthsCount}</strong>
                  </div>

                  <div className="text-right text-xs text-[#241C15]/60 font-medium">
                    Total Paid: <strong className="text-[#0F3D37]" style={monoStyle}>{formatCurrency(totalPaidAmount)}</strong>
                    <span className="mx-1.5">•</span>
                    Balance: <strong className="text-[#C1440E]" style={monoStyle}>{formatCurrency(totalRemainingAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* TAB 1: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-3">
                  {schedule.map((m) => {
                    const isPaid = m.status === 'paid' || parseFloat(m.balance) <= 0;
                    const isPartial = !isPaid && parseFloat(m.balance) > 0 && parseFloat(m.balance) < parseFloat(m.amount);
                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-2xl py-4 px-6 border border-[#241C15]/8 shadow-sm flex items-center justify-between hover:shadow-md transition"
                      >
                        {/* Left: Date */}
                        <div className="w-32 sm:w-36 text-sm font-medium text-[#241C15]">
                          {m.month_name}
                        </div>

                        {/* Middle: Real Amount & Paid info */}
                        <div className="text-center">
                          <div className="text-base font-bold text-[#1a2b49]" style={monoStyle}>
                            {formatCurrency(m.amount)}
                          </div>
                          {isPartial && (
                            <div className="text-[10px] font-bold text-emerald-600">
                              +{formatCurrency(parseFloat(m.amount) - parseFloat(m.balance))} paid
                            </div>
                          )}
                        </div>

                        {/* Right: Status badge */}
                        <div className="w-32 text-right flex items-center justify-end space-x-1.5">
                          {isPaid ? (
                            <div className="inline-flex items-center space-x-1.5">
                              <span className="text-xs font-semibold text-emerald-700 lowercase">paid</span>
                              <div className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                              </div>
                            </div>
                          ) : isPartial ? (
                            <div className="inline-flex items-center space-x-1.5">
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-amber-600 block uppercase">partial</span>
                                <span className="text-[10px] text-[#241C15]/50 block">bal: {formatCurrency(m.balance)}</span>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                <Clock className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-1.5">
                              <span className="text-xs font-semibold text-slate-400 lowercase">due</span>
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                <Clock className="w-3 h-3 text-slate-500 stroke-[2.5]" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="bg-white rounded-3xl p-6 border border-[#241C15]/8 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#241C15]">Official Payment Receipts</h3>
                  <div className="divide-y divide-[#241C15]/8">
                    {schedule.filter(m => m.status === 'paid').length === 0 ? (
                      <p className="text-xs text-[#241C15]/40 py-4">No completed payments yet.</p>
                    ) : (
                      schedule.filter(m => m.status === 'paid').map((p) => (
                        <div key={p.id} className="py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#241C15]">{p.ref}</p>
                            <p className="text-xs text-[#241C15]/50 mt-0.5">{p.date_paid} • {p.method} • {p.full_month} Rent</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#0F3D37]" style={monoStyle}>+{formatCurrency(p.amount)}</p>
                            <span className="text-[10px] text-[#0F3D37] font-semibold">Processed</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="bg-white rounded-3xl p-6 border border-[#241C15]/8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#241C15]/8 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#241C15]">1-Year Commercial Lease Contract</h3>
                      <p className="text-xs text-[#241C15]/50">Duero Public Market Municipal Unit</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-[#0F3D37]/10 text-[#0F3D37] text-xs font-bold border border-[#0F3D37]/20">
                      Active Agreement
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-[#241C15]/80">
                    <div className="flex justify-between py-1.5 border-b border-[#241C15]/5">
                      <span className="text-[#241C15]/50">Leased Stall Unit:</span>
                      <strong className="text-[#241C15]">{stallInfo.space_number} ({stallInfo.location})</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#241C15]/5">
                      <span className="text-[#241C15]/50">Lease Term:</span>
                      <strong className="text-[#241C15]">1 Full Year (12 Monthly Installments)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#241C15]/5">
                      <span className="text-[#241C15]/50">Total Space Amount:</span>
                      <strong className="text-[#5340C6]" style={monoStyle}>{formatCurrency(stallInfo.space_amount)}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#241C15]/5">
                      <span className="text-[#241C15]/50">Monthly Rent (Amount ÷ 12):</span>
                      <strong className="text-[#C1440E]" style={monoStyle}>{formatCurrency(stallInfo.monthly_rate)} / month</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#241C15]/5">
                      <span className="text-[#241C15]/50">Rental / Start Date:</span>
                      <strong className="text-[#241C15]">{startFormatted}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#241C15]/50">Contract Validity:</span>
                      <strong className="text-[#241C15]">12 Calendar Months</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default RenterYearlyLease;
