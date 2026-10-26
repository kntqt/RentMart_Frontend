import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import {
  Search,
  Eye,
  Store,
  Lock,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
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
const modalLabelClass = "block text-xs font-bold text-[#241C15]/60 uppercase mb-1";
const modalInputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition bg-white";

// Helper: Add months to a date string YYYY-MM-DD
function addMonthsToDate(dateStr, monthsToAdd) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split('T')[0];
}

// Helper: Calculate month difference between two date strings
function getDurationInMonths(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return {
    months: Math.max(0, diffMonths),
    days: diffDays,
    isValidSixMonths: diffDays >= 178 || diffMonths >= 6
  };
}

const RenterSpaces = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Reservation Modal
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveTarget, setReserveTarget] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(addMonthsToDate(new Date().toISOString().split('T')[0], 6));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Renter Status & Rentals
  const [myRentals, setMyRentals] = useState([]);
  const [unpaidBalance, setUnpaidBalance] = useState(0);
  const [hasUnpaidBalance, setHasUnpaidBalance] = useState(false);

  useEffect(() => {
    fetchSpaces();
    fetchMyRentals();
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setSpaces(res.data.spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const fetchMyRentals = async () => {
    try {
      const res = await api.get('/rentals/my-rentals');
      const data = res.data;
      if (Array.isArray(data)) {
        setMyRentals(data);
      } else {
        setMyRentals(data.rentals || []);
        setUnpaidBalance(data.unpaid_balance || 0);
        setHasUnpaidBalance(data.has_unpaid_balance || false);
      }
    } catch (error) {
      console.error('Error fetching my rentals:', error);
    }
  };

  const isAvailable = (status) => status === 'available';

  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    const minEnd = addMonthsToDate(newStartDate, 6);
    // If end date is now less than 6 months from new start date, update it
    if (!endDate || new Date(endDate) < new Date(minEnd)) {
      setEndDate(minEnd);
    }
  };

  const setTermPreset = (months) => {
    const newEnd = addMonthsToDate(startDate, months);
    setEndDate(newEnd);
  };

  const openReserveModal = (space) => {
    if (hasUnpaidBalance) {
      setFlash({
        type: 'error',
        message: `Reservation Blocked: You have an outstanding unpaid balance of ${formatCurrency(unpaidBalance)}. Market policy requires all existing balances to be settled before reserving additional stalls.`
      });
      return;
    }

    setReserveTarget(space);
    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(addMonthsToDate(todayStr, 6)); // Default to 6-month minimum
    setIsReserveModalOpen(true);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!reserveTarget || isSubmitting) return;

    // Check payment restriction
    if (hasUnpaidBalance) {
      setFlash({
        type: 'error',
        message: `Payment Restriction: You have an outstanding balance of ${formatCurrency(unpaidBalance)}. All balances must be settled before reserving another space.`
      });
      setIsReserveModalOpen(false);
      return;
    }

    // Check 6-month minimum
    const duration = getDurationInMonths(startDate, endDate);
    if (!duration.isValidSixMonths) {
      setFlash({
        type: 'error',
        message: 'Minimum rental period is 6 months. The system does not allow reservations for less than 6 months.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/rentals/renter-request', {
        space_id: reserveTarget.id,
        start_date: startDate,
        end_date: endDate
      });
      setFlash({
        type: 'success',
        message: res.data.message || `Reservation request for Stall ${reserveTarget.space_number} submitted! Awaiting staff confirmation.`
      });
      setIsReserveModalOpen(false);
      setSelectedSpace(null);
      fetchSpaces();
      fetchMyRentals();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error submitting reservation request. Please try again.';
      setFlash({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingRental = myRentals.some(r => r.status === 'pending');
  const minAllowedEndDate = addMonthsToDate(startDate, 6);
  const currentDuration = getDurationInMonths(startDate, endDate);

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Header with Reservation-Only Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Browse & Reserve Market Spaces</h1>
              <span className="px-3 py-0.5 rounded-full bg-[#E8A33D]/20 border border-[#E8A33D]/40 text-[#8a5f1f] text-[11px] font-bold uppercase tracking-wider">
                Reservation-Only
              </span>
            </div>
            <p className="text-sm text-[#241C15]/50 font-medium mt-1">
              Explore available commercial stalls in Duero Public Market. Submit your reservation request with a <strong>minimum 6-month term</strong>.
            </p>
          </div>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* PAYMENT RESTRICTION WARNING BANNER (When user has unpaid balance) */}
        {hasUnpaidBalance && (
          <div className="p-5 rounded-2xl bg-[#C1440E]/10 border-2 border-[#C1440E]/30 text-[#241C15] space-y-3 animate-in fade-in shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-[#C1440E] text-[#FBF6EA] flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#C1440E] uppercase tracking-wider">
                    Payment Restriction Active — New Space Reservations Blocked
                  </h3>
                  <p className="text-xs text-[#241C15]/75 mt-1 leading-relaxed">
                    You currently have an outstanding unpaid balance of <strong className="text-[#C1440E]" style={monoStyle}>{formatCurrency(unpaidBalance)}</strong> on your existing stall account. In accordance with Duero Public Market policies, you cannot submit new space reservations until this balance is settled in full.
                  </p>
                </div>
              </div>
              <Link
                to="/renter/transactions"
                className="px-4 py-2 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#C1440E]/20 transition flex-shrink-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View Balance & Receipts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 6-Month Minimum Lease Information Banner */}
        <div className="p-4 rounded-xl bg-[#0F3D37]/5 border border-[#0F3D37]/15 flex items-center justify-between gap-4 text-xs text-[#0F3D37]">
          <div className="flex items-center space-x-2.5 font-medium">
            <Info className="w-4 h-4 text-[#0F3D37] flex-shrink-0" />
            <span>
              <strong>Reservation Policy:</strong> All commercial stalls have a <strong>mandatory minimum rental period of 6 months</strong>. Instant rentals are disabled; all stalls are reserved upon review by municipal market staff.
            </span>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-lg bg-[#0F3D37]/10 font-bold text-[11px] whitespace-nowrap">
            Min. Lease: 6 Months
          </span>
        </div>

        {/* My Current Reservations / Leases Summary */}
        {myRentals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#241C15]/60 uppercase tracking-wider">My Stall Reservations & Leases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRentals.filter(r => ['pending', 'active'].includes(r.status)).map((rental) => (
                <div
                  key={rental.id}
                  className={`p-4 rounded-xl border shadow-sm transition ${
                    rental.status === 'pending'
                      ? 'bg-[#E8A33D]/10 border-[#E8A33D]/35'
                      : 'bg-[#0F3D37]/5 border-[#0F3D37]/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {rental.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-[#E8A33D]" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-[#0F3D37]" />
                      )}
                      <span className="text-sm font-bold text-[#241C15]">{rental.space_number}</span>
                    </div>
                    <StatusBadge status={rental.status} />
                  </div>
                  <p className="text-xs text-[#241C15]/60 font-medium truncate">{rental.location}</p>
                  <div className="mt-2 pt-2 border-t border-[#241C15]/8 flex items-center justify-between text-xs text-[#241C15]/60">
                    <span>Lease: <strong>{rental.start_date}</strong> → <strong>{rental.end_date || '6 Mos+'}</strong></span>
                    <span className="font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(rental.monthly_rate)}/yr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search space number, section, or location..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm font-semibold text-[#241C15]/80 focus:outline-none"
          >
            <option value="all">All Stalls</option>
            <option value="available">Available for Reservation</option>
            <option value="reserved">Reserved</option>
            <option value="rented">Currently Rented</option>
          </select>
        </div>

        {/* Space Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => {
            const available = isAvailable(s.status);

            return (
              <div key={s.id} className="bg-white rounded-2xl overflow-hidden border border-[#241C15]/8 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div className="relative h-44 w-full overflow-hidden bg-[#F6EFDE]">
                  <img src={getSpaceImageUrl(s.image, s.space_number)} alt={s.space_number} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 right-3"><StatusBadge status={s.status} /></div>
                  <div className="absolute bottom-3 left-3 bg-[#241C15]/85 px-3 py-1 rounded-md text-xs font-black text-[#FBF6EA]">{s.space_number}</div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-[#241C15]">{s.location}</p>
                    <p className="text-xs text-[#241C15]/50 line-clamp-2 leading-relaxed">{s.description}</p>
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-[#C1440E]/20 flex justify-between items-center text-xs">
                    <span className="text-[#241C15]/50">Size: <strong className="text-[#241C15]">{s.size_sqm} sqm</strong></span>
                    <span className="text-[#C1440E] font-bold text-sm" style={monoStyle}>{formatCurrency(s.monthly_rate)} / yr</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setSelectedSpace(s)}
                      className="w-full py-2.5 rounded-xl bg-[#241C15]/5 hover:bg-[#0F3D37] hover:text-[#FBF6EA] text-[#241C15] font-bold text-xs border border-[#241C15]/10 hover:border-[#0F3D37] transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>

                    {available ? (
                      <button
                        onClick={() => openReserveModal(s)}
                        disabled={hasPendingRental || hasUnpaidBalance}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                          hasUnpaidBalance
                            ? 'bg-[#C1440E]/15 text-[#C1440E] border border-[#C1440E]/30 cursor-not-allowed'
                            : hasPendingRental
                            ? 'bg-[#241C15]/10 text-[#241C15]/40 cursor-not-allowed border border-[#241C15]/8'
                            : 'bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] shadow-md shadow-[#C1440E]/20 cursor-pointer'
                        }`}
                        title={
                          hasUnpaidBalance
                            ? 'Cannot reserve: Outstanding unpaid balance exists'
                            : hasPendingRental
                            ? 'You already have a pending reservation request'
                            : 'Submit reservation request for this space'
                        }
                      >
                        <Store className="w-4 h-4" />
                        <span>
                          {hasUnpaidBalance
                            ? 'Blocked (Unpaid Balance)'
                            : hasPendingRental
                            ? 'Pending Request Exists'
                            : 'Reserve Space'}
                        </span>
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-xl bg-[#241C15]/10 text-[#241C15]/40 font-bold text-xs cursor-not-allowed border border-[#241C15]/8 flex items-center justify-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>{s.status === 'reserved' ? 'Reserved' : 'Unavailable'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Space Details Modal */}
        <Modal isOpen={!!selectedSpace} onClose={() => setSelectedSpace(null)} title={`Market Space Details — ${selectedSpace?.space_number}`}>
          {selectedSpace && (
            <div className="space-y-4" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              <div className="w-full h-52 rounded-xl overflow-hidden bg-[#F6EFDE] border border-[#241C15]/8">
                <img src={getSpaceImageUrl(selectedSpace.image, selectedSpace.space_number)} alt={selectedSpace.space_number} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[#241C15]/40 font-bold uppercase">Stall Status</span>
                <StatusBadge status={selectedSpace.status} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Market Section & Location</label>
                <p className="text-base font-bold text-[#241C15]">{selectedSpace.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-[#F6EFDE] p-4 rounded-xl border-2 border-dashed border-[#C1440E]/20">
                <div>
                  <label className="text-xs font-bold text-[#241C15]/40 uppercase">Floor Size</label>
                  <p className="text-lg font-bold text-[#241C15]">{selectedSpace.size_sqm} sqm</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#241C15]/40 uppercase">Yearly Rate (6-Mo. Min)</label>
                  <p className="text-lg font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(selectedSpace.monthly_rate)} / yr</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Description</label>
                <p className="text-sm text-[#241C15]/60 mt-1 leading-relaxed">{selectedSpace.description || 'Commercial stall space in Duero Public Market.'}</p>
              </div>

              <div className="pt-4 border-t border-[#241C15]/8">
                {isAvailable(selectedSpace.status) && !hasPendingRental && !hasUnpaidBalance ? (
                  <button
                    onClick={() => {
                      const tgt = selectedSpace;
                      setSelectedSpace(null);
                      openReserveModal(tgt);
                    }}
                    className="w-full py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/30 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Store className="w-5 h-5" />
                    <span>Reserve This Stall (Min. 6 Months)</span>
                  </button>
                ) : hasUnpaidBalance ? (
                  <div className="p-3 rounded-xl bg-[#C1440E]/10 border border-[#C1440E]/30 text-xs text-[#C1440E] font-bold text-center">
                    Reservation Blocked: Settle your outstanding balance of {formatCurrency(unpaidBalance)} first.
                  </div>
                ) : isAvailable(selectedSpace.status) && hasPendingRental ? (
                  <button disabled className="w-full py-3 rounded-xl bg-[#241C15]/10 text-[#241C15]/50 font-bold text-sm cursor-not-allowed">
                    You already have a pending reservation request
                  </button>
                ) : (
                  <button disabled className="w-full py-3 rounded-xl bg-[#241C15]/10 text-[#241C15]/50 font-bold text-sm cursor-not-allowed">
                    This Space is Currently {selectedSpace.status.charAt(0).toUpperCase() + selectedSpace.status.slice(1)}
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Space Reservation Request Modal (With 6-Month Minimum Validation) */}
        <Modal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          title={`Reserve Market Space — ${reserveTarget?.space_number}`}
        >
          {reserveTarget && (
            <form onSubmit={handleReserveSubmit} className="space-y-5" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {/* Stall Summary Box */}
              <div className="bg-[#F6EFDE] p-4 rounded-xl border border-[#241C15]/8 space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden bg-[#241C15]/5">
                  <img src={getSpaceImageUrl(reserveTarget.image, reserveTarget.space_number)} alt={reserveTarget.space_number} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-[#241C15]/40 font-bold uppercase">Stall Selected for Reservation</p>
                    <p className="text-lg font-bold text-[#241C15]">{reserveTarget.space_number}</p>
                    <p className="text-xs font-medium text-[#241C15]/60">{reserveTarget.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#241C15]/40 font-bold uppercase block">Annual Rate</span>
                    <span className="text-sm font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(reserveTarget.monthly_rate)} / yr</span>
                  </div>
                </div>
              </div>

              {/* Quick Lease Duration Selectors */}
              <div>
                <label className={modalLabelClass}>Quick Lease Term Selection (Min. 6 Months)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTermPreset(6)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${
                      endDate === addMonthsToDate(startDate, 6)
                        ? 'bg-[#0F3D37] text-[#FBF6EA] border-[#0F3D37]'
                        : 'bg-white text-[#241C15]/70 border-[#241C15]/15 hover:bg-[#F6EFDE]'
                    }`}
                  >
                    6 Months (Min)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTermPreset(12)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${
                      endDate === addMonthsToDate(startDate, 12)
                        ? 'bg-[#0F3D37] text-[#FBF6EA] border-[#0F3D37]'
                        : 'bg-white text-[#241C15]/70 border-[#241C15]/15 hover:bg-[#F6EFDE]'
                    }`}
                  >
                    1 Year (12 Mos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTermPreset(24)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${
                      endDate === addMonthsToDate(startDate, 24)
                        ? 'bg-[#0F3D37] text-[#FBF6EA] border-[#0F3D37]'
                        : 'bg-white text-[#241C15]/70 border-[#241C15]/15 hover:bg-[#F6EFDE]'
                    }`}
                  >
                    2 Years (24 Mos)
                  </button>
                </div>
              </div>

              {/* Custom Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#C1440E]" />
                    Desired Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={modalInputClass}
                  />
                </div>
                <div>
                  <label className={modalLabelClass}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#C1440E]" />
                    End Date (Min 6 Months) *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={minAllowedEndDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={modalInputClass}
                  />
                  <p className="text-[10px] text-[#241C15]/50 mt-1">
                    Minimum allowed: <strong>{minAllowedEndDate}</strong>
                  </p>
                </div>
              </div>

              {/* Real-Time Duration Validation Pill */}
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                currentDuration.isValidSixMonths
                  ? 'bg-[#0F3D37]/10 border-[#0F3D37]/25 text-[#0F3D37]'
                  : 'bg-[#C1440E]/10 border-[#C1440E]/30 text-[#C1440E]'
              }`}>
                <div className="flex items-center space-x-2">
                  {currentDuration.isValidSixMonths ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0F3D37] flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#C1440E] flex-shrink-0" />
                  )}
                  <span>
                    Selected Term: <strong>{currentDuration.days} days</strong> (~{Math.max(1, Math.round(currentDuration.days / 30))} months)
                  </span>
                </div>
                <span className="font-bold text-[11px] uppercase">
                  {currentDuration.isValidSixMonths ? '✓ Valid (≥ 6 Months)' : '⚠ Too Short (< 6 Mos)'}
                </span>
              </div>

              {/* Information Policy Note */}
              <div className="p-3 rounded-lg bg-[#E8A33D]/10 border border-[#E8A33D]/30 text-xs text-[#8a5f1f]">
                <strong>Reservation Notice:</strong> Submitting this request reserves the stall for your vendor account. Market staff will verify your profile and approve the reservation into an active lease.
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReserveModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-xs hover:bg-[#241C15]/12 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !currentDuration.isValidSixMonths || hasUnpaidBalance}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center space-x-2 ${
                    isSubmitting || !currentDuration.isValidSixMonths || hasUnpaidBalance
                      ? 'bg-[#241C15]/20 text-[#241C15]/40 cursor-not-allowed shadow-none'
                      : 'bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] shadow-[#C1440E]/25 cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#FBF6EA]/30 border-t-[#FBF6EA] rounded-full animate-spin"></div>
                      <span>Submitting Reservation...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Reservation Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default RenterSpaces;

