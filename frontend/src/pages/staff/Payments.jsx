import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, Search, DollarSign } from 'lucide-react';

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
const modalInputClass = "w-full px-4 py-3 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";
const modalLabelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1";

const StaffPayments = () => {
  useMarketFonts();
  const [renterBillings, setRenterBillings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [selectedRenterId, setSelectedRenterId] = useState('');
  const [paymentType, setPaymentType] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [selectedRenterObj, setSelectedRenterObj] = useState(null);

  useEffect(() => {
    fetchRenterBillings();
    fetchPayments();
  }, [search]);

  useEffect(() => {
    if (selectedRenterId) {
      const found = renterBillings.find(b => b.renter_id === parseInt(selectedRenterId));
      setSelectedRenterObj(found || null);
      if (found) {
        const bal = parseFloat(found.balance);
        if (paymentType === 'monthly') {
          setAmountPaid((bal / 12).toFixed(2));
        } else {
          setAmountPaid(bal.toString());
        }
      }
    } else {
      setSelectedRenterObj(null);
      setAmountPaid('');
    }
  }, [selectedRenterId, paymentType, renterBillings]);

  const fetchRenterBillings = async () => {
    try {
      const res = await api.get('/billings?status=unpaid');
      setRenterBillings(res.data || []);
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  };

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
    if (!selectedRenterId || !amountPaid) return;
    try {
      const res = await api.post('/payments', {
        renter_id: selectedRenterId,
        amount_paid: amountPaid,
        payment_type: paymentType,
        payment_method: paymentMethod,
        reference_number: referenceNumber
      });
      setFlash({ type: 'success', message: `Payment processed! Official Receipt #${res.data.reference_number}.` });
      setSelectedRenterId('');
      setAmountPaid('');
      setReferenceNumber('');
      fetchRenterBillings();
      fetchPayments();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error processing payment.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Record Market Collection Payments</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Process vendor monthly installments or full yearly balances with FIFO billing allocation.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Process Payment Form Card */}
        <div className="p-8 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#241C15]/8 pb-4">
            <h3 className="text-lg font-bold text-[#241C15] flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#C1440E]" />
              <span>Process Vendor Payment</span>
            </h3>

            {/* Payment Type Tabs */}
            <div className="flex bg-[#F6EFDE] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentType('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  paymentType === 'monthly' ? 'bg-white text-[#241C15] shadow-sm' : 'text-[#241C15]/50 hover:text-[#241C15]'
                }`}
              >
                Monthly Installment
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  paymentType === 'yearly' ? 'bg-white text-[#241C15] shadow-sm' : 'text-[#241C15]/50 hover:text-[#241C15]'
                }`}
              >
                Full Yearly Balance
              </button>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={modalLabelClass}>Select Active Renter with Unpaid Balance *</label>
                <select required value={selectedRenterId} onChange={(e) => setSelectedRenterId(e.target.value)} className={modalInputClass + " font-semibold"}>
                  <option value="">-- Choose Vendor Renter --</option>
                  {renterBillings.map((b) => (
                    <option key={b.id} value={b.renter_id}>
                      {b.first_name} {b.last_name} ({b.space_number}) — Outstanding: {formatCurrency(b.balance)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={modalLabelClass}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={modalInputClass + " font-semibold"}>
                  <option value="Cash">Cash Collection</option>
                  <option value="Check">Manager's Check</option>
                  <option value="GCash">GCash / Digital</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={modalLabelClass}>Amount to Pay (₱) *</label>
                <input type="number" step="0.01" required value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className={modalInputClass + " text-base font-bold text-[#0F3D37]"} style={monoStyle} />
              </div>
              <div>
                <label className={modalLabelClass}>Reference / Receipt Number</label>
                <input type="text" placeholder="e.g. OR-2026-099 (Auto-generated if empty)" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className={modalInputClass} style={monoStyle} />
              </div>
            </div>

            {/* Selected Renter Summary Box */}
            {selectedRenterObj && (
              <div className="p-5 rounded-2xl bg-[#0F3D37]/8 border border-[#0F3D37]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase text-[#0F3D37]">Payment Collection Summary</p>
                  <p className="text-base font-bold text-[#241C15] mt-0.5">{selectedRenterObj.first_name} {selectedRenterObj.last_name} — {selectedRenterObj.space_number}</p>
                  <p className="text-xs text-[#0F3D37] mt-1">Current Unpaid Balance: <strong style={monoStyle}>{formatCurrency(selectedRenterObj.balance)}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0F3D37]">Remaining After Payment</p>
                  <p className="text-xl font-bold text-[#0F3D37]" style={monoStyle}>
                    {formatCurrency(Math.max(0, parseFloat(selectedRenterObj.balance) - (parseFloat(amountPaid) || 0)))}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedRenterId || !amountPaid}
              className="w-full py-4 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-xl shadow-[#C1440E]/25 transition disabled:opacity-50"
            >
              Record Payment Transaction
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
                    <th className="py-4 px-6">Amount Paid</th>
                    <th className="py-4 px-6">Balance After</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241C15]/8 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-[#241C15]/40 font-medium">No recent payment transactions recorded.</td>
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
