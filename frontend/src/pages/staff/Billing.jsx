import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Search, Trash2, Calculator } from 'lucide-react';

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
const modalInputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";
const modalLabelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1";

const StaffBilling = () => {
  useMarketFonts();
  const [billings, setBillings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [billingMonth, setBillingMonth] = useState(new Date().toISOString().split('T')[0]);
  const [downpayment, setDownpayment] = useState('0');
  const [dueDate, setDueDate] = useState('');
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

  const rate = selectedRentalObj ? parseFloat(selectedRentalObj.monthly_rate) : 0;
  const dpNum = parseFloat(downpayment) || 0;
  const netBalance = Math.max(0, rate - dpNum);
  const monthlyInstallment = (netBalance / 12).toFixed(2);

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Billing Management</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Create lease billing accounts, downpayment schedules, and payment due dates.</p>
          </div>
          <button
            onClick={() => setIsSetupOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Billing Setup</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by renter name or space #..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm font-semibold text-[#241C15]/80 focus:outline-none"
          >
            <option value="">All Billing Statuses</option>
            <option value="unpaid">unpaid</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
            <option value="waived">waived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {billings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-[#241C15]/40 font-medium">No billing accounts set up yet.</td>
                  </tr>
                ) : (
                  billings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F6EFDE]/60 transition">
                      <td className="py-4 px-6 text-xs font-bold text-[#241C15]/70" style={monoStyle}>
                        #BIL-{String(b.id).padStart(5, '0')}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#241C15]">{b.first_name} {b.last_name}</p>
                        <p className="text-xs text-[#C1440E] font-bold">{b.space_number} ({b.location})</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#241C15]" style={monoStyle}>
                        {formatCurrency(b.amount_due)}
                      </td>
                      <td className="py-4 px-6 text-[#241C15]/60 font-semibold" style={monoStyle}>
                        {formatCurrency(b.downpayment)}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#C1440E]" style={monoStyle}>
                        {formatCurrency(b.balance)}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#241C15]/50 font-medium">
                        {formatDate(b.due_date)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className="px-3 py-1 rounded-lg bg-[#F6EFDE] border border-[#241C15]/10 text-xs font-bold text-[#241C15]/80 focus:outline-none"
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
                            className="p-2 text-[#241C15]/35 hover:text-[#C1440E] hover:bg-[#C1440E]/8 rounded-lg transition"
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
            <label className={modalLabelClass}>Select Active Lease Rental *</label>
            <select
              required
              value={selectedRentalId}
              onChange={(e) => setSelectedRentalId(e.target.value)}
              className={modalInputClass + " font-semibold"}
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
              <label className={modalLabelClass}>Billing Start Date *</label>
              <input type="date" required value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} className={modalInputClass} />
            </div>
            <div>
              <label className={modalLabelClass}>Down Payment (₱)</label>
              <input type="number" value={downpayment} onChange={(e) => setDownpayment(e.target.value)} className={modalInputClass + " font-semibold"} />
            </div>
          </div>

          <div>
            <label className={modalLabelClass}>Final Payment Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={modalInputClass} />
          </div>

          {/* Real-time Installment Breakdown Box */}
          {selectedRentalObj && (
            <div className="p-5 rounded-2xl bg-[#241C15] text-[#FBF6EA] space-y-3">
              <div className="flex items-center space-x-2 text-[#E8A33D] font-bold text-xs">
                <Calculator className="w-4 h-4" />
                <span>Real-Time Installment Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                  <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Yearly Rate</p>
                  <p className="text-sm font-bold text-[#FBF6EA] mt-0.5" style={monoStyle}>{formatCurrency(rate)}</p>
                </div>
                <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                  <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Net Balance</p>
                  <p className="text-sm font-bold text-[#E8A33D] mt-0.5" style={monoStyle}>{formatCurrency(netBalance)}</p>
                </div>
                <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                  <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Est. Monthly</p>
                  <p className="text-sm font-bold text-[#5DCAA5] mt-0.5" style={monoStyle}>{formatCurrency(monthlyInstallment)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsSetupOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25">
              Confirm Billing Setup
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffBilling;
