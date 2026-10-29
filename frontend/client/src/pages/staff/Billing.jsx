import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Search, Trash2, Receipt, Calculator } from 'lucide-react';

const StaffBilling = () => {
  const [billings, setBillings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Setup Modal
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [billingMonth, setBillingMonth] = useState(new Date().toISOString().split('T')[0]);
  const [downpayment, setDownpayment] = useState('0');
  const [dueDate, setDueDate] = useState('');

  // Selected Rental Calculations
  const [selectedRentalObj, setSelectedRentalObj] = useState(null);

  useEffect(() => {
    fetchBillings();
    fetchActiveRentals();
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedRentalId) {
      const found = activeRentals.find(r => r.id === parseInt(selectedRentalId));
      setSelectedRentalObj(found || null);
    } else {
      setSelectedRentalObj(null);
    }
  }, [selectedRentalId, activeRentals]);

  const fetchBillings = async () => {
    try {
      const res = await api.get(`/billings?status=${statusFilter}&search=${search}`);
      setBillings(res.data || []);
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  };

  const fetchActiveRentals = async () => {
    try {
      const res = await api.get('/rentals?status=active');
      setActiveRentals(res.data || []);
    } catch (error) {
      console.error('Error fetching active rentals:', error);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRentalId) return;

    try {
      const calculatedDueDate = dueDate || new Date(new Date(billingMonth).setFullYear(new Date(billingMonth).getFullYear() + 1)).toISOString().split('T')[0];

      await api.post('/billings/setup', {
        rental_id: selectedRentalId,
        billing_month: billingMonth,
        downpayment: downpayment,
        due_date: calculatedDueDate
      });

      setFlash({ type: 'success', message: 'Billing setup completed. Breakdown generated.' });
      setIsSetupOpen(false);
      fetchBillings();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error setting up billing.' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/billings/${id}/status`, { status });
      setFlash({ type: 'success', message: `Billing status updated to ${status}.` });
      fetchBillings();
    } catch (error) {
      setFlash({ type: 'error', message: 'Error updating billing status.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unpaid billing record?')) return;
    try {
      await api.delete(`/billings/${id}`);
      setFlash({ type: 'success', message: 'Unpaid billing record deleted.' });
      fetchBillings();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error deleting billing.' });
    }
  };

  // Calculation Math
  const rate = selectedRentalObj ? parseFloat(selectedRentalObj.monthly_rate) : 0;
  const dpNum = parseFloat(downpayment) || 0;
  const netBalance = Math.max(0, rate - dpNum);
  const monthlyInstallment = (netBalance / 12).toFixed(2);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Billing Management</h1>
            <p className="text-sm text-slate-500 font-medium">Create lease billing accounts, downpayment schedules, and payment due dates.</p>
          </div>
          <button
            onClick={() => setIsSetupOpen(true)}
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Billing Setup</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by renter name or space #..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700"
          >
            <option value="">All Billing Statuses</option>
            <option value="unpaid">unpaid</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
            <option value="waived">waived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Reference ID</th>
                  <th className="py-4 px-6">Renter / Stall Space</th>
                  <th className="py-4 px-6">Yearly Rate</th>
                  <th className="py-4 px-6">Down Payment</th>
                  <th className="py-4 px-6">Current Balance</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {billings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">No billing accounts set up yet.</td>
                  </tr>
                ) : (
                  billings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                        #BIL-{String(b.id).padStart(5, '0')}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{b.first_name} {b.last_name}</p>
                        <p className="text-xs text-primary-600 font-bold">{b.space_number} ({b.location})</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {formatCurrency(b.amount_due)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-semibold">
                        {formatCurrency(b.downpayment)}
                      </td>
                      <td className="py-4 px-6 font-black text-rose-600">
                        {formatCurrency(b.balance)}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {formatDate(b.due_date)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="unpaid">unpaid</option>
                          <option value="paid">paid</option>
                          <option value="overdue">overdue</option>
                          <option value="waived">waived</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {b.status === 'unpaid' && (
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Setup Billing Modal */}
      <Modal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} title="Billing Setup & Installment Breakdown">
        <form onSubmit={handleSetupSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Active Lease Rental *</label>
            <select
              required
              value={selectedRentalId}
              onChange={(e) => setSelectedRentalId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">-- Choose Renter Lease --</option>
              {activeRentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.first_name} {r.last_name} — {r.space_number} ({formatCurrency(r.monthly_rate)}/yr)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Billing Start Date *</label>
              <input
                type="date"
                required
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Down Payment (₱)</label>
              <input
                type="number"
                value={downpayment}
                onChange={(e) => setDownpayment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Final Payment Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Default: 1 Year from Start"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          {/* Real-time Installment Breakdown Box */}
          {selectedRentalObj && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
              <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs">
                <Calculator className="w-4 h-4" />
                <span>Real-Time Installment Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-800/80 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Yearly Rate</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">{formatCurrency(rate)}</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Net Balance</p>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">{formatCurrency(netBalance)}</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Est. Monthly</p>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">{formatCurrency(monthlyInstallment)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsSetupOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
              Confirm Billing Setup
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffBilling;
