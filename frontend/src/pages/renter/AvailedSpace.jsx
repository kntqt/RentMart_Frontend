import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate, getSpaceImageUrl } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  Store,
  CalendarDays,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Calendar,
  ChevronRight
} from 'lucide-react';

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
const generateScheduleFromStart = (startDateStr, monthlyRate = 2500, apiSchedule = []) => {
  if (apiSchedule && apiSchedule.length > 0) {
    const mapped = apiSchedule.map((b, idx) => {
      const d = new Date(b.date_to_pay || b.due_date);
      const formatted = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : (b.date_to_pay || b.due_date);
      const isPaid = b.status === 'paid' || parseFloat(b.balance) <= 0;
      const amt = parseFloat(b.amount_due) || monthlyRate;

      return {
        id: b.id || idx + 1,
        month_name: formatted,
        amount: amt,
        balance: isPaid ? 0 : parseFloat(b.balance || amt),
        status: isPaid ? 'paid' : (b.status === 'overdue' ? 'overdue' : 'unpaid'),
      };
    });

    if (mapped.length < 12) {
      const base = startDateStr ? new Date(startDateStr) : new Date();
      const validBase = !isNaN(base.getTime()) ? base : new Date();
      const startDay = validBase.getDate();
      for (let i = mapped.length; i < 12; i++) {
        const cur = new Date(validBase.getFullYear(), validBase.getMonth() + i, 1);
        const maxDays = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
        cur.setDate(Math.min(startDay, maxDays));
        const formatted = cur.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        mapped.push({
          id: 1000 + i,
          month_name: formatted,
          amount: monthlyRate,
          balance: monthlyRate,
          status: 'unpaid',
        });
      }
    }
    return mapped;
  }

  if (!startDateStr) return [];

  const base = new Date(startDateStr);
  const validBase = !isNaN(base.getTime()) ? base : new Date();
  const startDay = validBase.getDate();

  return Array.from({ length: 12 }, (_, i) => {
    const cur = new Date(validBase.getFullYear(), validBase.getMonth() + i, 1);
    const maxDays = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    cur.setDate(Math.min(startDay, maxDays));
    const formatted = cur.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    return {
      id: i + 1,
      month_name: formatted,
      amount: monthlyRate,
      balance: monthlyRate,
      status: 'unpaid',
    };
  });
};

const RenterAvailedSpace = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/renter').then(res => {
      const d = res.data;
      if (d.assignedSpaces && d.assignedSpaces.length > 0) {
        const enriched = d.assignedSpaces.map(sp => {
          const raw = parseFloat(sp.monthly_rate) || 2500;
          const totalAmt = parseFloat(sp.space_amount) || (raw >= 10000 ? raw : raw * 12);
          const monthly = Math.round((totalAmt / 12) * 100) / 100;
          return {
            ...sp,
            space_amount: totalAmt,
            monthly_rate: monthly
          };
        });
        setSpaces(enriched);

        const startD = enriched[0].start_date || new Date().toISOString().split('T')[0];
        const rate = enriched[0].monthly_rate;
        const gen = generateScheduleFromStart(startD, rate, d.monthlySchedule);
        setSchedule(gen);
      } else {
        setSpaces([]);
        setSchedule([]);
      }
    }).catch(err => {
      console.warn('Dashboard fetch fallback:', err);
      setSpaces([]);
      setSchedule([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const totalPaidCount = schedule.filter(m => m.status === 'paid').length;
  const totalMonthsCount = schedule.length;
  const totalRemainingAmount = schedule.filter(m => m.status !== 'paid').reduce((sum, m) => sum + (parseFloat(m.balance ?? m.amount) || 0), 0);
  const startDateFormatted = spaces[0]?.start_date ? formatDate(spaces[0].start_date) : 'Today';

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>My Availed Market Spaces</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Detailed information on your leased commercial unit, 1-year space amount, and monthly payment schedule.</p>
          </div>
          {spaces.length > 0 && (
            <Link
              to="/renter/yearly-lease"
              className="px-5 py-2.5 rounded-xl bg-[#5340C6] hover:bg-[#4332ab] text-white font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          )}
        </div>

        {/* Empty State: Shown when renter has not availed any stalls yet */}
        {!loading && spaces.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#241C15]/8 shadow-sm space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F3D37]/10 text-[#0F3D37] flex items-center justify-center">
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#241C15]" style={displayStyle}>No Availed Market Stall Yet</h2>
              <p className="text-sm text-[#241C15]/60 max-w-md mx-auto">
                You do not currently have any active rented stalls. Browse our available commercial spaces to select and avail a stall. Your 1-year payment schedule will begin on your rental date.
              </p>
            </div>
            <div>
              <Link
                to="/renter/spaces"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Browse Available Spaces</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 1-Year Summary Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm flex items-center gap-4" style={{ borderLeft: '4px solid #5340C6' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#5340C6]/10 text-[#5340C6]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">Total Space Amount (1 Year)</p>
                  <p className="text-xl font-bold text-[#5340C6]" style={monoStyle}>{formatCurrency(spaces[0]?.space_amount || 0)}</p>
                  <p className="text-xs text-[#0F3D37] font-semibold">Monthly: {formatCurrency(spaces[0]?.monthly_rate || 0)} / mo (÷ 12)</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm flex items-center gap-4" style={{ borderLeft: '4px solid #C1440E' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#C1440E]/10 text-[#C1440E]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">Total Remaining Balance</p>
                  <p className="text-xl font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(totalRemainingAmount)}</p>
                  <p className="text-xs text-[#241C15]/40 font-medium">{12 - totalPaidCount} unpaid installments</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm flex items-center gap-4" style={{ borderLeft: '4px solid #0F3D37' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#0F3D37]/10 text-[#0F3D37]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#241C15]/40">Schedule Starts</p>
                  <p className="text-xl font-bold text-[#241C15]" style={monoStyle}>{startDateFormatted}</p>
                  <p className="text-xs text-[#0F3D37] font-medium">Rental / Lease start date</p>
                </div>
              </div>
            </div>

            {/* Availed Space Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spaces.map((s, idx) => (
                <div key={idx} className="overflow-hidden rounded-2xl bg-white border border-[#241C15]/8 shadow-sm">
                  <div className="relative h-48 w-full bg-[#F6EFDE]">
                    <img src={getSpaceImageUrl(s.image, s.space_number)} alt={s.space_number} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4"><StatusBadge status={s.status} /></div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl text-[#241C15]" style={displayStyle}>{s.space_number}</h3>
                        <p className="text-sm font-bold text-[#241C15]/60 mt-0.5">{s.location}</p>
                      </div>
                      <span className="text-xs font-bold text-[#0F3D37] bg-[#0F3D37]/10 px-2.5 py-1 rounded-lg">
                        12 Months Term
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-[#F6EFDE] p-4 rounded-xl border-2 border-dashed border-[#C1440E]/20 text-center">
                      <div>
                        <p className="text-[10px] text-[#241C15]/40 uppercase font-bold">Stall Size</p>
                        <p className="text-sm font-bold text-[#241C15] mt-0.5">{s.size_sqm} sqm</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#241C15]/40 uppercase font-bold">Space Amount</p>
                        <p className="text-sm font-bold text-[#5340C6] mt-0.5" style={monoStyle}>{formatCurrency(s.space_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#241C15]/40 uppercase font-bold">Monthly (÷12)</p>
                        <p className="text-sm font-bold text-[#C1440E] mt-0.5" style={monoStyle}>{formatCurrency(s.monthly_rate)}<span className="text-[10px] text-[#241C15]/40">/mo</span></p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#241C15]/60 font-medium pt-2 border-t border-[#241C15]/8">
                      <div className="flex justify-between">
                        <span>Lease Term:</span>
                        <strong className="text-[#241C15]">1 Full Year (12 Months)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Reservation / Start Date:</span>
                        <strong className="text-[#241C15]">{formatDate(s.start_date)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Lease Expiry:</span>
                        <strong className="text-[#241C15]">{formatDate(s.end_date)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 12-Month Schedule Section with Link to Pay */}
            {schedule.length > 0 && (
              <div className="bg-[#F8F9FD] rounded-3xl p-6 border border-[#241C15]/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#241C15]/8 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#241C15] flex items-center space-x-2">
                      <CalendarDays className="w-5 h-5 text-[#5340C6]" />
                      <span>1-Year Schedule (Starts on: {startDateFormatted})</span>
                    </h3>
                    <p className="text-xs text-[#241C15]/50 mt-0.5">
                      Paid: <strong className="text-emerald-600">{totalPaidCount} / 12</strong> months • Monthly: <strong>{formatCurrency(spaces[0]?.monthly_rate || 0)}</strong> • Remaining: <strong>{formatCurrency(totalRemainingAmount)}</strong>
                    </p>
                  </div>
                  <Link
                    to="/renter/yearly-lease"
                    className="px-4 py-2 rounded-xl bg-[#5340C6] hover:bg-[#4332ab] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Click to Pay Months</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Vertical list of clean cards */}
                <div className="space-y-2.5 max-w-xl mx-auto">
                  {schedule.map((m) => {
                    const isPaid = m.status === 'paid' || parseFloat(m.balance) <= 0;
                    const isPartial = !isPaid && parseFloat(m.balance) > 0 && parseFloat(m.balance) < parseFloat(m.amount);
                    return (
                      <Link
                        key={m.id}
                        to="/renter/yearly-lease"
                        className="bg-white rounded-2xl py-3.5 px-5 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-[#5340C6] transition block"
                      >
                        {/* Left: Date based on reservation start */}
                        <div className="w-32 text-sm font-medium text-[#241C15]">
                          {m.month_name}
                        </div>

                        {/* Middle: Bold Real Amount */}
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

                        {/* Right: paid + green checkmark circle or click to pay */}
                        <div className="w-28 text-right flex items-center justify-end space-x-1.5">
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
                                <span className="text-[10px] font-bold text-amber-600 uppercase block">partial</span>
                                <span className="text-[9px] text-[#241C15]/50 block">bal: {formatCurrency(m.balance)}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-1">
                              <span className="text-xs font-bold text-[#5340C6] uppercase">Pay</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#5340C6]" />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default RenterAvailedSpace;
