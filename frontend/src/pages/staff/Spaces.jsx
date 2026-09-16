import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, getSpaceImageUrl } from '../../utils/formatters';
import {
  Search,
  UserCheck,
  Store,
  CheckCircle,
  ShieldAlert,
  Check,
  X,
  Layers,
  Ban,
  Clock,
  Building2,
  Wrench
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
const modalInputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition bg-white";
const modalLabelClass = "block text-xs font-bold text-[#241C15]/60 uppercase tracking-wider mb-1";

const StaffSpaces = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, reserved: 0, maintenance: 0 });
  const [pendingRentals, setPendingRentals] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flash, setFlash] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [renterEmail, setRenterEmail] = useState('');
  const [lookedUpRenter, setLookedUpRenter] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSpaces();
    fetchPendingRentals();
    fetchActiveRentals();
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setSpaces(res.data.spaces || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const fetchPendingRentals = async () => {
    try {
      const res = await api.get('/rentals/pending');
      setPendingRentals(res.data || []);
    } catch (error) {
      console.error('Error fetching pending rentals:', error);
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

  const refreshAll = () => {
    fetchSpaces();
    fetchPendingRentals();
    fetchActiveRentals();
  };

  const handleApproveRental = async (rentalId) => {
    try {
      await api.patch(`/rentals/${rentalId}/approve`);
      setFlash({ type: 'success', message: 'Rental request approved! Space is now set to Rented.' });
      refreshAll();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error approving rental request.' });
    }
  };

  const handleRejectRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to reject this rental request? The space will become available again.')) return;
    try {
      await api.patch(`/rentals/${rentalId}/reject`);
      setFlash({ type: 'success', message: 'Rental request rejected. Space is now available again.' });
      refreshAll();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error rejecting rental request.' });
    }
  };

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to cancel this rental? The space will become available again.')) return;
    try {
      await api.patch(`/rentals/${rentalId}/cancel`);
      setFlash({ type: 'success', message: 'Rental cancelled. Space is now available.' });
      refreshAll();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error cancelling rental.' });
    }
  };

  const handleCompleteRental = async (rentalId) => {
    if (!window.confirm('Mark this rental as completed? The space will become available again for new tenants.')) return;
    try {
      await api.patch(`/rentals/${rentalId}/complete`);
      setFlash({ type: 'success', message: 'Rental completed. Space is now available for new tenants.' });
      refreshAll();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error completing rental.' });
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
    setIsSubmitting(true);
    try {
      const res = await api.post('/rentals', {
        space_id: selectedSpace.id,
        renter_email: lookedUpRenter.email,
        start_date: startDate,
        end_date: endDate
      });
      const rentalId = res.data.rental_id;
      // Staff can auto-approve directly upon assignment
      if (rentalId) {
        await api.patch(`/rentals/${rentalId}/approve`);
        setFlash({ type: 'success', message: `Lease assigned and approved for space ${selectedSpace.space_number} to ${lookedUpRenter.first_name} ${lookedUpRenter.last_name}!` });
      } else {
        setFlash({ type: 'success', message: `Lease assignment created for space ${selectedSpace.space_number}.` });
      }
      setIsAssignOpen(false);
      refreshAll();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error submitting rental assignment.' });
    } finally {
      setIsSubmitting(false);
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
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Space Management & Lease Approvals</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Review renter space applications, process approvals, and assign stalls to vendors.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Pending Rental Approvals Queue (Staff Task) */}
        {pendingRentals.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#E8A33D]/10 border-2 border-[#E8A33D]/40 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-[#8a5f1f] font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-[#C1440E]" />
                <span style={displayStyle}>Pending Rented Space Approvals ({pendingRentals.length})</span>
              </div>
              <span className="text-xs bg-[#E8A33D] text-[#241C15] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Staff Task Required
              </span>
            </div>

            <p className="text-xs text-[#241C15]/70">
              The following renters have requested a market stall. Review vendor details and approve or reject their rental request.
            </p>

            <div className="divide-y divide-[#E8A33D]/25">
              {pendingRentals.map((pr) => (
                <div key={pr.rental_id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#241C15] text-[#FBF6EA] font-black text-xs">
                        {pr.space_number}
                      </span>
                      <p className="font-bold text-[#241C15] text-sm">
                        {pr.first_name} {pr.last_name} <span className="text-xs font-normal text-[#241C15]/60">({pr.email})</span>
                      </p>
                    </div>
                    <p className="text-xs text-[#241C15]/70 font-medium">
                      Location: <strong>{pr.location || 'Duero Public Market'}</strong> • Lease Term: <strong>{pr.start_date}</strong> to <strong>{pr.end_date || '1 Year'}</strong>
                    </p>
                    <p className="text-xs text-[#C1440E] font-bold" style={monoStyle}>
                      Yearly Rate: {formatCurrency(pr.monthly_rate)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApproveRental(pr.rental_id)}
                      className="px-4 py-2.5 rounded-xl bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#0F3D37]/20 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Rental</span>
                    </button>
                    <button
                      onClick={() => handleRejectRental(pr.rental_id)}
                      className="px-4 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#C1440E]/20 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Rentals Management */}
        {activeRentals.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#0F3D37]/5 border border-[#0F3D37]/15 space-y-4">
            <div className="flex items-center space-x-2 text-[#0F3D37] font-bold text-base">
              <Layers className="w-5 h-5" />
              <span>Active Leased Spaces ({activeRentals.length})</span>
            </div>

            <div className="divide-y divide-[#0F3D37]/10">
              {activeRentals.map((ar) => (
                <div key={ar.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#241C15]">{ar.first_name} {ar.last_name} ({ar.email})</p>
                    <p className="text-xs text-[#241C15]/60 font-medium mt-1">
                      Space: <strong className="text-[#0F3D37] font-bold">{ar.space_number}</strong> ({ar.location}) • Rate: {formatCurrency(ar.monthly_rate)}/yr
                    </p>
                    <p className="text-xs text-[#241C15]/50 mt-0.5">
                      Period: {ar.start_date} → {ar.end_date || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCompleteRental(ar.id)}
                      className="px-4 py-2 rounded-xl bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#0F3D37]/20 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleCancelRental(ar.id)}
                      className="px-4 py-2 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#C1440E]/20 transition"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Space Stats Overview Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#241C15]/8 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#241C15]/8 text-[#241C15] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-[#241C15]/40 tracking-wider">Total</p>
              <p className="text-xl font-bold text-[#241C15]" style={monoStyle}>{stats.total || spaces.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200/60 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-emerald-800/60 tracking-wider">Available</p>
              <p className="text-xl font-bold text-emerald-700" style={monoStyle}>
                {stats.available !== undefined ? stats.available : spaces.filter(s => s.status === 'available').length}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-200/60 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-amber-800/60 tracking-wider">Reserved</p>
              <p className="text-xl font-bold text-amber-700" style={monoStyle}>
                {stats.reserved !== undefined ? stats.reserved : spaces.filter(s => s.status === 'reserved').length}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-red-200/60 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-red-800/60 tracking-wider">Rented</p>
              <p className="text-xl font-bold text-red-700" style={monoStyle}>
                {stats.rented !== undefined ? stats.rented : spaces.filter(s => s.status === 'rented').length}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-orange-200/60 shadow-sm flex items-center space-x-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-orange-800/60 tracking-wider">Maintenance</p>
              <p className="text-xl font-bold text-orange-700" style={monoStyle}>
                {stats.maintenance !== undefined ? stats.maintenance : spaces.filter(s => s.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search space # or location..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm font-semibold text-[#241C15]/80 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Market Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden border border-[#241C15]/8 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="relative h-44 w-full overflow-hidden bg-[#F6EFDE]">
                <img src={getSpaceImageUrl(s.image, s.space_number)} alt={s.space_number} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute top-3 right-3"><StatusBadge status={s.status} /></div>
                <div className="absolute bottom-3 left-3 bg-[#241C15]/85 px-3 py-1 rounded-md text-xs font-black text-[#FBF6EA]">{s.space_number}</div>
              </div>
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#241C15]">{s.location || 'Duero Public Market'}</p>
                  <p className="text-xs text-[#241C15]/50 line-clamp-2 leading-relaxed">{s.description || 'Market stall unit'}</p>
                </div>
                <div className="pt-3 border-t-2 border-dashed border-[#C1440E]/20 flex justify-between items-center text-xs">
                  <span className="text-[#241C15]/50">Size: <strong className="text-[#241C15]">{s.size_sqm} sqm</strong></span>
                  <span className="text-[#C1440E] font-bold text-sm" style={monoStyle}>{formatCurrency(s.monthly_rate)} / yr</span>
                </div>
                <div className="pt-1">
                  {s.status === 'available' ? (
                    <button onClick={() => openAssignModal(s)} className="w-full py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs shadow-md shadow-[#C1440E]/20 transition flex items-center justify-center space-x-2 cursor-pointer">
                      <UserCheck className="w-4 h-4" />
                      <span>Assign Renter</span>
                    </button>
                  ) : s.status === 'reserved' ? (
                    <div className="w-full py-2.5 rounded-xl bg-[#facc15] text-[#422006] font-black text-xs text-center border-2 border-[#eab308] shadow-sm uppercase tracking-wide">
                      Pending Staff Approval
                    </div>
                  ) : (
                    <button disabled className="w-full py-2.5 rounded-xl bg-[#241C15]/10 text-[#241C15]/40 font-bold text-xs cursor-not-allowed">Stall Occupied</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Renter Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={`Assign Renter — ${selectedSpace?.space_number}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-6">
          <div className="bg-[#F6EFDE] p-4 rounded-xl border border-[#241C15]/8">
            <p className="text-xs text-[#241C15]/40 font-bold uppercase">Selected Market Stall</p>
            <p className="text-lg font-bold text-[#241C15]">{selectedSpace?.space_number} ({selectedSpace?.location})</p>
            <p className="text-sm font-bold text-[#C1440E] mt-1" style={monoStyle}>Yearly Lease Rate: {formatCurrency(selectedSpace?.monthly_rate)}</p>
          </div>

          {/* AJAX Renter Email Lookup */}
          <div className="space-y-3">
            <label className={modalLabelClass}>Renter Email Lookup *</label>
            <div className="flex space-x-2">
              <input type="email" required value={renterEmail} onChange={(e) => setRenterEmail(e.target.value)} placeholder="juandelacruz@duero.com" className={"flex-1 " + modalInputClass} />
              <button type="button" onClick={handleRenterLookup} className="px-5 py-2.5 rounded-lg bg-[#241C15] hover:bg-[#241C15]/90 text-[#FBF6EA] font-bold text-xs transition cursor-pointer">
                Lookup
              </button>
            </div>

            {lookupError && <p className="text-xs text-[#C1440E] font-semibold">{lookupError}</p>}

            {lookedUpRenter && (
              <div className="p-4 rounded-xl bg-[#0F3D37]/8 border border-[#0F3D37]/20 space-y-2">
                <div className="flex items-center space-x-2 text-[#0F3D37] font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Renter Record</span>
                </div>
                <p className="text-sm font-bold text-[#241C15]">{lookedUpRenter.first_name} {lookedUpRenter.middle_name} {lookedUpRenter.last_name}</p>
                <p className="text-xs text-[#0F3D37]">Phone: {lookedUpRenter.contact_number || 'N/A'} • Unpaid Bills: {lookedUpRenter.unpaid_bill_count}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={modalLabelClass}>Lease Start Date *</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={modalInputClass} />
            </div>
            <div>
              <label className={modalLabelClass}>Lease End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={modalInputClass} />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAssignOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm hover:bg-[#241C15]/12 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 transition cursor-pointer">
              {isSubmitting ? 'Assigning...' : 'Assign & Activate Lease'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffSpaces;
