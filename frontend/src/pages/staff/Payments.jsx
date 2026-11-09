import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, Search, DollarSign, Calendar, TrendingDown, CheckCircle2 } from 'lucide-react';

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
const modalInputClass = "w-full px-4 py-3 rounded-xl border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition bg-white";
const modalLabelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1.5";

const StaffPayments = () => {
  useMarketFonts();
  const [renterBillings, setRenterBillings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [selectedRenterId, setSelectedRenterId] = useState('');
  const [selectedBillingId, setSelectedBillingId] = useState(''); // What month to pay!
  const [renterSearch, setRenterSearch] = useState('');
  const [paymentType, setPaymentType] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select from URL search parameters (e.g. from Billing page "Pay" button)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rId = params.get('renter_id');
    const bId = params.get('billing_id');
    const amt = params.get('amount');
    if (rId) setSelectedRenterId(rId);
    if (bId) setSelectedBillingId(bId);
    if (amt) setAmountPaid(amt);
  }, []);

  useEffect(() => {
    fetchRenterBillings();
    fetchPayments();
  }, [search]);

  // Distinct renters list with their total balances
  const distinctRenters = [];
  const seenRenters = new Set();
  (renterBillings || []).forEach(b => {
    if (!seenRenters.has(b.renter_id)) {
      seenRenters.add(b.renter_id);
      const allForRenter = renterBillings.filter(x => x.renter_id === b.renter_id);
      const totalBal = allForRenter.reduce((s, x) => s + parseFloat(x.balance || 0), 0);
      distinctRenters.push({
        renter_id: b.renter_id,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.email,
        space_number: b.space_number,
        total_balance: totalBal,
        unpaid_count: allForRenter.length
      });
    }
  });

  // Unpaid months for the selected renter
  const renterUnpaidMonths = selectedRenterId
    ? renterBillings.filter(b => b.renter_id === parseInt(selectedRenterId) && parseFloat(b.balance) > 0)
    : [];

  const selectedRenterObj = selectedRenterId
    ? distinctRenters.find(r => r.renter_id === parseInt(selectedRenterId))
    : null;

  const selectedMonthObj = selectedBillingId
    ? renterUnpaidMonths.find(m => m.id === parseInt(selectedBillingId))
    : (renterUnpaidMonths.length > 0 ? renterUnpaidMonths[0] : null);

  // When renter changes, auto-select first unpaid month
  useEffect(() => {
    if (selectedRenterId && renterUnpaidMonths.length > 0) {
      const firstMonth = renterUnpaidMonths[0];
      setSelectedBillingId(firstMonth.id.toString());
      setAmountPaid(parseFloat(firstMonth.balance || 2000).toFixed(2));
    } else {
      setSelectedBillingId('');
      setAmountPaid('');
    }
  }, [selectedRenterId]);

  const fetchRenterBillings = async () => {
    try {
      // Fetch all billings and filter for ones with positive balance
      const res = await api.get('/billings');
      const unpaidOrOverdue = (res.data || []).filter(b => parseFloat(b.balance) > 0 && b.status !== 'paid');
      setRenterBillings(unpaidOrOverdue);
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  };

  const filteredRenters = distinctRenters.filter(r => {
    if (!renterSearch.trim()) return true;
    const q = renterSearch.toLowerCase();
    const name = `${r.first_name} ${r.last_name}`.toLowerCase();
    const email = (r.email || '').toLowerCase();
    const space = (r.space_number || '').toLowerCase();
    return name.includes(q) || email.includes(q) || space.includes(q);
  });

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments?search=${search}`);
      setPayments(res.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedRenterId || !amountPaid || isSubmitting) return;

    setIsSubmitting(true);
    const monthNamePaid = selectedMonthObj?.month_name || selectedMonthObj?.billing_month || 'Monthly Installment';

    try {
      const res = await api.post('/payments', {
        renter_id: selectedRenterId,
        billing_id: selectedBillingId || undefined,
        amount_paid: amountPaid,
        payment_type: paymentType,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined
      });

      const updatedRemaining = res.data.total_overall_to_pay ?? res.data.totalRemainingBalance;
      setFlash({
        type: 'success',
        message: `Payment of ₱${parseFloat(amountPaid).toLocaleString()}.00 recorded for ${monthNamePaid}! Official Receipt #${res.data.reference_number}. Remaining balance minused to ₱${parseFloat(updatedRemaining || 0).toLocaleString()}.00.`
      });

      setSelectedRenterId('');
      setSelectedBillingId('');
      setAmountPaid('');
      setReferenceNumber('');
      fetchRenterBillings();
      fetchPayments();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error processing payment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTotalBal = selectedRenterObj ? parseFloat(selectedRenterObj.total_balance || 0) : 0;
  const payAmtNum = parseFloat(amountPaid) || 0;
  const balanceAfter = Math.max(0, currentTotalBal - payAmtNum);
  const selectedMonthBal = selectedMonthObj ? parseFloat(selectedMonthObj.balance || 0) : 0;
  const isOverpayment = payAmtNum > selectedMonthBal && selectedMonthBal > 0;
  const isPartialPayment = payAmtNum < selectedMonthBal && payAmtNum > 0;
  const excessAmount = Math.max(0, payAmtNum - selectedMonthBal);

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Record Market Collection Payments</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Select the renter and choose which month to pay — marks the schedule as paid and minuses the remaining balance.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Process Payment Form Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#241C15]/8 pb-4 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-[#241C15] flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#C1440E]" />
              <span>Record Vendor Payment</span>
            </h3>

            {/* Quick Helper */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F3D37] bg-[#0F3D37]/10 px-3 py-1 rounded-xl">
                Real-Time Balance Deduction
              </span>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Select Renter */}
              <div>
                <label className={modalLabelClass}>1. Search / Select Renter with Unpaid Schedule *</label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#241C15]/35" />
                  <input
                    type="text"
                    value={renterSearch}
                    onChange={(e) => setRenterSearch(e.target.value)}
                    placeholder="Search name, email or stall (e.g. Kevin)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#241C15]/15 text-xs text-[#241C15] focus:outline-none focus:border-[#C1440E] bg-[#F8F9FD]"
                  />
                </div>
                <select
                  required
                  value={selectedRenterId}
                  onChange={(e) => setSelectedRenterId(e.target.value)}
                  className={modalInputClass + " font-semibold"}
                >
                  <option value="">-- Choose Vendor Renter ({filteredRenters.length}) --</option>
                  {filteredRenters.map((r) => (
                    <option key={r.renter_id} value={r.renter_id}>
                      {r.first_name} {r.last_name} ({r.email}) — Stall {r.space_number} (Unpaid: {formatCurrency(r.total_balance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Select What Month to Pay */}
              <div>
                <label className={modalLabelClass}>2. What Month to Pay (Schedule Installment) *</label>
                <select
                  required
                  disabled={!selectedRenterId || renterUnpaidMonths.length === 0}
                  value={selectedBillingId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    setSelectedBillingId(bId);
                    const found = renterUnpaidMonths.find(m => m.id === parseInt(bId));
                    if (found) {
                      setAmountPaid(parseFloat(found.balance || 2500).toFixed(2));
                    }
                  }}
                  className={modalInputClass + " font-semibold disabled:bg-slate-50 disabled:text-slate-400"}
                >
                  {!selectedRenterId ? (
                    <option value="">-- First choose a renter above --</option>
                  ) : renterUnpaidMonths.length === 0 ? (
                    <option value="">-- All months fully paid! --</option>
                  ) : (
                    <>
                      <option value="">-- Choose Month to Pay --</option>
                      {renterUnpaidMonths.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.month_name || m.billing_month} (Due: {formatDate(m.date_to_pay || m.due_date)}) — {formatCurrency(m.balance)}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Payment Method */}
              <div>
                <label className={modalLabelClass}>3. Payment Method *</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={modalInputClass + " font-semibold"}>
                  <option value="GCash">GCash / Digital</option>
                  <option value="Cash">Cash Collection</option>
                  <option value="Check">Manager's Check</option>
                  <option value="Maya">Maya</option>
                </select>
              </div>

              {/* Amount to Pay */}
              <div>
                <label className={modalLabelClass}>4. Amount to Pay (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className={modalInputClass + " text-base font-bold text-[#0F3D37]"}
                  style={monoStyle}
                />
              </div>

              {/* Receipt Reference */}
              <div>
                <label className={modalLabelClass}>5. Official Receipt Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. OR-2026-105 (Auto if empty)"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className={modalInputClass}
                  style={monoStyle}
                />
              </div>
            </div>

            {/* Selected Renter & Month Payment Summary Box */}
            {selectedRenterObj && (
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-[#F8F9FD] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5340C6]">Payment Allocation Summary</p>
                    <p className="text-base font-bold text-[#241C15]">
                      {selectedRenterObj.first_name} {selectedRenterObj.last_name} — Stall {selectedRenterObj.space_number}
                    </p>
                    <p className="text-xs text-[#241C15]/70">
                      Target Month to Pay: <strong className="text-[#5340C6]">{selectedMonthObj?.month_name || selectedMonthObj?.billing_month || 'Selected Month'}</strong> (Due Balance: {formatCurrency(selectedMonthBal)})
                    </p>
                    <p className="text-xs text-[#241C15]/50">
                      Total Outstanding Before: <strong style={monoStyle}>{formatCurrency(currentTotalBal)}</strong>
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Remaining Balance After Pay</span>
                    <p className="text-2xl font-bold text-emerald-700" style={monoStyle}>
                      {formatCurrency(balanceAfter)}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Minuses {formatCurrency(payAmtNum)} from schedule
                    </span>
                  </div>
                </div>

                {/* Overpayment / Partial Payment Real-Time Explanation */}
                {isOverpayment && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <span>✨ Overpayment Allocation:</span>
                    </p>
                    <p>
                      <strong>{formatCurrency(selectedMonthBal)}</strong> will mark <strong>{selectedMonthObj?.month_name || 'this month'}</strong> as <span className="uppercase text-emerald-700 font-bold">Paid</span>.
                    </p>
                    <p>
                      The excess <strong>{formatCurrency(excessAmount)}</strong> will automatically deduct and minus from the <strong>next month's schedule</strong>!
                    </p>
                  </div>
                )}

                {isPartialPayment && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
                    <span className="font-bold">ℹ️ Partial Payment: </span>
                    Paying <strong>{formatCurrency(payAmtNum)}</strong> for {selectedMonthObj?.month_name || 'this month'}. Remaining balance for this month will be <strong>{formatCurrency(selectedMonthBal - payAmtNum)}</strong>.
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedRenterId || !amountPaid || isSubmitting}
              className="w-full py-4 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-xl shadow-[#C1440E]/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Recording Payment...' : `Record Payment & Mark Month as Paid`}</span>
            </button>
          </form>
        </div>

        {/* Recent Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#241C15]">Recent Collection Audit Log</h3>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#241C15]/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter transactions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#241C15]/10 text-xs text-[#241C15] focus:outline-none focus:border-[#C1440E]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                    <th className="py-4 px-6">Ref #</th>
                    <th className="py-4 px-6">Renter Name</th>
                    <th className="py-4 px-6">Space</th>
                    <th className="py-4 px-6">Month</th>
                    <th className="py-4 px-6">Amount Paid</th>
                    <th className="py-4 px-6">Balance After</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241C15]/8 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-[#241C15]/40 font-medium">No recent payment transactions recorded.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F6EFDE]/60 transition">
                        <td className="py-4 px-6 text-xs font-bold text-[#241C15]/70" style={monoStyle}>
                          {p.reference_number || `REC-${p.id}`}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#241C15]">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-[#241C15]/70">
                          {p.space_number}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#241C15]/60 font-semibold">
                          {p.month_name || '—'}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#0F3D37]" style={monoStyle}>
                          {formatCurrency(p.amount_paid)}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#241C15]/60" style={monoStyle}>
                          {formatCurrency(p.balance_after)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-[#F6EFDE] text-[#241C15]/70 text-xs font-bold border border-[#241C15]/10">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-[#241C15]/50 font-medium">
                          {formatDate(p.payment_date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffPayments;
