import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, Search, DollarSign, Receipt, CheckCircle2 } from 'lucide-react';

const StaffPayments = () => {
  const [renterBillings, setRenterBillings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Payment Form state
  const [selectedRenterId, setSelectedRenterId] = useState('');
  const [paymentType, setPaymentType] = useState('monthly'); // monthly vs yearly
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Selected Renter object math
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Record Market Collection Payments</h1>
          <p className="text-sm text-slate-500 font-medium">Process vendor monthly installments or full yearly balances with FIFO billing allocation.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Process Payment Form Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <span>Process Vendor Payment</span>
            </h3>

            {/* Payment Type Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setPaymentType('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  paymentType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly Installment
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('yearly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  paymentType === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Full Yearly Balance
              </button>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Active Renter with Unpaid Balance *</label>
                <select
                  required
                  value={selectedRenterId}
                  onChange={(e) => setSelectedRenterId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary-500"
                >
                  <option value="">-- Choose Vendor Renter --</option>
                  {renterBillings.map((b) => (
                    <option key={b.id} value={b.renter_id}>
                      {b.first_name} {b.last_name} ({b.space_number}) — Outstanding: {formatCurrency(b.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Cash">Cash Collection</option>
                  <option value="Check">Manager's Check</option>
                  <option value="GCash">GCash / Digital</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount to Pay (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-black text-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference / Receipt Number</label>
                <input
                  type="text"
                  placeholder="e.g. OR-2026-099 (Auto-generated if empty)"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Selected Renter Summary Box */}
            {selectedRenterObj && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Payment Collection Summary</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{selectedRenterObj.first_name} {selectedRenterObj.last_name} — {selectedRenterObj.space_number}</p>
                  <p className="text-xs text-emerald-800 mt-1">Current Unpaid Balance: <strong>{formatCurrency(selectedRenterObj.balance)}</strong></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-700">Remaining After Payment</p>
                  <p className="text-xl font-black text-emerald-900">
                    {formatCurrency(Math.max(0, parseFloat(selectedRenterObj.balance) - (parseFloat(amountPaid) || 0)))}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedRenterId || !amountPaid}
              className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-xl shadow-primary-500/25 transition disabled:opacity-50"
            >
              Record Payment Transaction
            </button>
          </form>
        </div>

        {/* Recent Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Collection Audit Log</h3>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter transactions..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Ref #</th>
                    <th className="py-4 px-6">Renter Name</th>
                    <th className="py-4 px-6">Space</th>
                    <th className="py-4 px-6">Amount Paid</th>
                    <th className="py-4 px-6">Balance After</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">No recent payment transactions recorded.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                          {p.reference_number || `REC-${p.id}`}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-slate-700">
                          {p.space_number}
                        </td>
                        <td className="py-4 px-6 font-black text-emerald-600">
                          {formatCurrency(p.amount_paid)}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600">
                          {formatCurrency(p.balance_after)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">
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
