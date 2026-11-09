import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Search, Trash2, Calculator, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

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

// 24 Month Selection Options (No calendar pickers)
const monthOptions = [
  { value: '2026-01-01', label: 'January 2026' },
  { value: '2026-02-01', label: 'February 2026' },
  { value: '2026-03-01', label: 'March 2026' },
  { value: '2026-04-01', label: 'April 2026' },
  { value: '2026-05-01', label: 'May 2026' },
  { value: '2026-06-01', label: 'June 2026' },
  { value: '2026-07-01', label: 'July 2026' },
  { value: '2026-08-01', label: 'August 2026' },
  { value: '2026-09-01', label: 'September 2026' },
  { value: '2026-10-01', label: 'October 2026' },
  { value: '2026-11-01', label: 'November 2026' },
  { value: '2026-12-01', label: 'December 2026' },
  { value: '2027-01-01', label: 'January 2027' },
  { value: '2027-02-01', label: 'February 2027' },
  { value: '2027-03-01', label: 'March 2027' },
  { value: '2027-04-01', label: 'April 2027' },
  { value: '2027-05-01', label: 'May 2027' },
  { value: '2027-06-01', label: 'June 2027' },
  { value: '2027-07-01', label: 'July 2027' },
  { value: '2027-08-01', label: 'August 2027' },
  { value: '2027-09-01', label: 'September 2027' },
  { value: '2027-10-01', label: 'October 2027' },
  { value: '2027-11-01', label: 'November 2027' },
  { value: '2027-12-01', label: 'December 2027' },
];

const StaffBilling = () => {
  useMarketFonts();
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [billingMode, setBillingMode] = useState('single'); // 'single' (Bill specific month e.g. March) | 'full' (1-year schedule)
  const [renterSearch, setRenterSearch] = useState('');
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [singleMonth, setSingleMonth] = useState('2026-03-01');
  const [customAmount, setCustomAmount] = useState('2500');
  const [billingMonth, setBillingMonth] = useState('2026-11-01');
  const [downpayment, setDownpayment] = useState('0');
  const [selectedRentalObj, setSelectedRentalObj] = useState(null);

  useEffect(() => {
    fetchBillings();
    fetchActiveRentals();
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedRentalId) {
      const found = activeRentals.find(r => r.id === parseInt(selectedRentalId));
      setSelectedRentalObj(found || null);
      if (found && found.monthly_rate) {
        setCustomAmount(parseFloat(found.monthly_rate).toFixed(2));
      }
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

  // Filter rentals by typed search name / email / stall
  const filteredRentals = activeRentals.filter(r => {
    if (!renterSearch.trim()) return true;
    const q = renterSearch.toLowerCase();
    const name = `${r.first_name} ${r.last_name}`.toLowerCase();
    const email = (r.email || '').toLowerCase();
    const space = (r.space_number || '').toLowerCase();
    return name.includes(q) || email.includes(q) || space.includes(q);
  });

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRentalId) return;
    try {
      if (billingMode === 'single') {
        // Task 1: Create a single billing for the selected month (e.g. March 2500)
        let res;
        try {
          res = await api.post('/billings', {
            rental_id: selectedRentalId,
            billing_month: singleMonth,
            amount_due: customAmount
          });
        } catch (errPost) {
          if (errPost.response?.status === 404) {
            res = await api.post('/billings/setup', {
              rental_id: selectedRentalId,
              billing_month: singleMonth,
              monthly_rate: customAmount
            });
          } else {
            throw errPost;
          }
        }
        setFlash({ type: 'success', message: res.data?.message || 'Monthly billing saved successfully.' });
      } else {
        // Full 1-year monthly schedule generation starting from selected month
        await api.post('/billings/setup', {
          rental_id: selectedRentalId,
          billing_month: billingMonth,
          downpayment: downpayment
        });
        setFlash({ type: 'success', message: 'Billing setup completed. 1-Year (12-Month) schedule generated.' });
      }
      setIsSetupOpen(false);
      fetchBillings();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error creating billing record.' });
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
  const monthlyInstallment = rate;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Billing Management</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Generate monthly billing schedules for active leases — one billing record per month.</p>
          </div>
          <button
            onClick={() => setIsSetupOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Generate Monthly Billing</span>
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
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-6">Down Payment</th>
                  <th className="py-4 px-6">Current Balance</th>
                  <th className="py-4 px-6">Monthly Amount</th>
                  <th className="py-4 px-6">Date to Pay</th>
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
                      <td className="py-4 px-6 text-[#241C15] font-semibold text-xs">
                        {b.month_name || (() => { try { const d = new Date(b.billing_month); return d.toLocaleDateString('en-US',{month:'long',year:'numeric'}); } catch(e){ return b.billing_month; }})()}
                      </td>
                      <td className="py-4 px-6 text-[#241C15]/60 font-semibold" style={monoStyle}>
                        {formatCurrency(b.downpayment)}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#C1440E]" style={monoStyle}>
                        {formatCurrency(b.balance)}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#241C15]" style={monoStyle}>{formatCurrency(b.amount_due)}</td>
                      <td className="py-4 px-6 text-xs text-[#241C15]/50 font-medium">
                        {formatDate(b.date_to_pay || b.due_date)}
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
                        <div className="flex items-center justify-end space-x-2">
                          {b.status !== 'paid' && (
                            <button
                              onClick={() => navigate(`/staff/payments?renter_id=${b.renter_id}&billing_id=${b.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-[#0F3D37] hover:bg-[#092b26] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                              title="Continue to payments"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                          {b.status === 'unpaid' && (
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-2 text-[#241C15]/35 hover:text-[#C1440E] hover:bg-[#C1440E]/8 rounded-lg transition"
                              title="Delete unpaid billing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Setup / Create Billing Modal */}
      <Modal 
        isOpen={isSetupOpen} 
        onClose={() => setIsSetupOpen(false)} 
        title={billingMode === 'single' ? "Create Month Billing for Renter" : "Generate 1-Year Monthly Schedule"}
      >
        <form onSubmit={handleSetupSubmit} className="space-y-5">
          {/* Billing Mode Tabs */}
          <div className="flex bg-[#F6EFDE] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setBillingMode('single')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                billingMode === 'single' 
                  ? 'bg-white text-[#C1440E] shadow-sm' 
                  : 'text-[#241C15]/60 hover:text-[#241C15]'
              }`}
            >
              Bill Specific Month (e.g. March)
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('full')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                billingMode === 'full' 
                  ? 'bg-white text-[#C1440E] shadow-sm' 
                  : 'text-[#241C15]/60 hover:text-[#241C15]'
              }`}
            >
              Full 1-Year Schedule
            </button>
          </div>

          {/* 1. Quick Search Renter Name */}
          <div className="space-y-1.5">
            <label className={modalLabelClass}>1. Search Renter Name or Stall</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#241C15]/35" />
              <input
                type="text"
                value={renterSearch}
                onChange={(e) => setRenterSearch(e.target.value)}
                placeholder="Type renter name (e.g. Kevin, Juan)..."
                className={modalInputClass + " pl-10"}
              />
            </div>
          </div>

          {/* 2. Select Active Lease */}
          <div>
            <label className={modalLabelClass}>2. Select Active Lease * ({filteredRentals.length} available)</label>
            <select
              required
              value={selectedRentalId}
              onChange={(e) => setSelectedRentalId(e.target.value)}
              className={modalInputClass + " font-semibold"}
            >
              <option value="">-- Choose Renter Lease --</option>
              {filteredRentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.first_name} {r.last_name} — Stall {r.space_number} ({formatCurrency(r.monthly_rate)}/mo)
                </option>
              ))}
            </select>
          </div>

          {billingMode === 'single' ? (
            /* =================== SINGLE MONTH BILLING (NO CALENDARS, ONLY SELECT MONTH) =================== */
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>Select Month to Pay *</label>
                  <select
                    required
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(e.target.value)}
                    className={modalInputClass + " font-bold text-[#0F3D37]"}
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#241C15]/50 block mt-1">
                    Select target month (e.g. March 2026).
                  </span>
                </div>

                <div>
                  <label className={modalLabelClass}>Monthly Amount to Pay (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className={modalInputClass + " font-bold text-[#0F3D37] text-base"}
                    style={monoStyle}
                  />
                  <span className="text-[10px] text-[#241C15]/50 block mt-1">
                    Standard monthly space rate.
                  </span>
                </div>
              </div>

              {selectedRentalObj && (
                <div className="p-4 rounded-xl bg-[#F6EFDE]/80 border border-[#241C15]/10 space-y-1">
                  <p className="text-xs font-bold text-[#241C15]">
                    Target Renter: <span className="text-[#C1440E]">{selectedRentalObj.first_name} {selectedRentalObj.last_name}</span>
                  </p>
                  <p className="text-xs text-[#241C15]/70">
                    Stall: <strong>{selectedRentalObj.space_number}</strong> ({selectedRentalObj.location}) • Rate: {formatCurrency(selectedRentalObj.monthly_rate)}/mo
                  </p>
                  <p className="text-xs text-[#0F3D37] font-semibold pt-1">
                    ✓ Clicking "Save Month Billing" creates this monthly bill directly so staff can record payments.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* =================== FULL 1-YEAR SCHEDULE (NO CALENDARS, ONLY SELECT STARTING MONTH) =================== */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>Select Starting Month (1-Year Lease) *</label>
                  <select
                    required
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className={modalInputClass + " font-bold text-[#0F3D37]"}
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#241C15]/50 block mt-1">
                    Will generate 12 consecutive months starting from this month.
                  </span>
                </div>
                <div>
                  <label className={modalLabelClass}>Down Payment (₱, Optional)</label>
                  <input
                    type="number"
                    value={downpayment}
                    onChange={(e) => setDownpayment(e.target.value)}
                    className={modalInputClass + " font-semibold"}
                    placeholder="0"
                  />
                  <span className="text-[10px] text-[#241C15]/50 block mt-1">
                    Any upfront down payment will credit the first month(s).
                  </span>
                </div>
              </div>

              {selectedRentalObj && (
                <div className="p-5 rounded-2xl bg-[#241C15] text-[#FBF6EA] space-y-3">
                  <div className="flex items-center space-x-2 text-[#E8A33D] font-bold text-xs">
                    <Calculator className="w-4 h-4" />
                    <span>Real-Time Installment Breakdown</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                      <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Monthly Rate</p>
                      <p className="text-sm font-bold text-[#FBF6EA] mt-0.5" style={monoStyle}>{formatCurrency(rate)}</p>
                    </div>
                    <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                      <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Net Balance</p>
                      <p className="text-sm font-bold text-[#E8A33D] mt-0.5" style={monoStyle}>{formatCurrency(netBalance)}</p>
                    </div>
                    <div className="bg-[#FBF6EA]/8 p-3 rounded-xl">
                      <p className="text-[10px] text-[#FBF6EA]/50 uppercase font-bold">Per Month</p>
                      <p className="text-sm font-bold text-[#5DCAA5] mt-0.5" style={monoStyle}>{formatCurrency(monthlyInstallment)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsSetupOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25">
              {billingMode === 'single' ? "Save Month Billing" : "Generate 1-Year Schedule"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffBilling;
