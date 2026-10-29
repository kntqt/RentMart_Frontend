import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { Search, UserCheck, Store, Calendar, CheckCircle } from 'lucide-react';

const StaffSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);

  // AJAX Renter Lookup state
  const [renterEmail, setRenterEmail] = useState('');
  const [lookedUpRenter, setLookedUpRenter] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSpaces();
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${search}`);
      setSpaces(res.data.spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const handleRenterLookup = async () => {
    if (!renterEmail) return;
    setLookupError('');
    setLookedUpRenter(null);
    try {
      const res = await api.get(`/rentals/lookup?email=${encodeURIComponent(renterEmail)}`);
      setLookedUpRenter(res.data);
    } catch (error) {
      setLookupError(error.response?.data?.message || 'No registered renter found with this email.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!lookedUpRenter) {
      setLookupError('Please lookup and verify a registered renter first.');
      return;
    }

    try {
      await api.post('/rentals', {
        space_id: selectedSpace.id,
        renter_email: lookedUpRenter.email,
        start_date: startDate,
        end_date: endDate
      });

      setFlash({ type: 'success', message: `Rental assignment submitted for space ${selectedSpace.space_number}. Awaiting Admin sign-off.` });
      setIsAssignOpen(false);
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error submitting rental assignment.' });
    }
  };

  const openAssignModal = (s) => {
    setSelectedSpace(s);
    setRenterEmail('');
    setLookedUpRenter(null);
    setLookupError('');
    setIsAssignOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Space Lease Assignment</h1>
          <p className="text-sm text-slate-500 font-medium">Browse available stalls and assign verified vendors.</p>
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
              placeholder="Search space # or location..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">{s.space_number}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{s.location}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Size: <strong className="text-slate-700">{s.size_sqm} sqm</strong></span>
                  <span className="text-primary-600 font-extrabold text-sm">{formatCurrency(s.monthly_rate)} / yr</span>
                </div>
              </div>

              {s.status === 'available' ? (
                <button
                  onClick={() => openAssignModal(s)}
                  className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Renter</span>
                </button>
              ) : (
                <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed">
                  Stall Occupied
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assign Renter Modal with AJAX Lookup */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign Renter — ${selectedSpace?.space_number}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase">Selected Market Stall</p>
            <p className="text-lg font-black text-slate-900">{selectedSpace?.space_number} ({selectedSpace?.location})</p>
            <p className="text-sm font-bold text-primary-600 mt-1">Yearly Lease Rate: {formatCurrency(selectedSpace?.monthly_rate)}</p>
          </div>

          {/* AJAX Renter Email Lookup */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase">Renter Email Lookup *</label>
            <div className="flex space-x-2">
              <input
                type="email"
                required
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
                placeholder="juandelacruz@duero.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleRenterLookup}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Lookup
              </button>
            </div>

            {lookupError && <p className="text-xs text-rose-600 font-semibold">{lookupError}</p>}

            {/* Verified Renter Details Card */}
            {lookedUpRenter && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Renter Record</span>
                </div>
                <p className="text-sm font-extrabold">{lookedUpRenter.first_name} {lookedUpRenter.middle_name} {lookedUpRenter.last_name}</p>
                <p className="text-xs text-emerald-800">Phone: {lookedUpRenter.contact_number || 'N/A'} • Unpaid Bills: {lookedUpRenter.unpaid_bill_count}</p>
              </div>
            )}
          </div>

          {/* Lease Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lease Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lease End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Default: 1 Year"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAssignOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
              Submit Lease Assignment
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffSpaces;
