import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import { Search, Eye, Store, Lock, Calendar, CheckCircle, Clock } from 'lucide-react';

const RenterSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Rental Request Modal State
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [rentTarget, setRentTarget] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Renter's own rentals
  const [myRentals, setMyRentals] = useState([]);

  useEffect(() => {
    fetchSpaces();
    fetchMyRentals();
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${search}`);
      setSpaces(res.data.spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const fetchMyRentals = async () => {
    try {
      const res = await api.get('/rentals/my-rentals');
      setMyRentals(res.data || []);
    } catch (error) {
      console.error('Error fetching my rentals:', error);
    }
  };

  const isAvailable = (status) => status === 'available';

  const openRentModal = (space) => {
    setRentTarget(space);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsRentModalOpen(true);
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!rentTarget || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/rentals/renter-request', {
        space_id: rentTarget.id,
        start_date: startDate,
        end_date: endDate || undefined
      });

      setFlash({ type: 'success', message: res.data.message || `Rental request for ${rentTarget.space_number} submitted successfully! Awaiting admin approval.` });
      setIsRentModalOpen(false);
      setSelectedSpace(null);

      // Re-fetch data to show updated statuses
      fetchSpaces();
      fetchMyRentals();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error submitting rental request. Please try again.';
      setFlash({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if renter already has a pending rental
  const hasPendingRental = myRentals.some(r => r.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse Duero Market Spaces</h1>
          <p className="text-sm text-slate-500 font-medium">Explore all available commercial stalls in Duero Public Market.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* My Active Rentals Summary */}
        {myRentals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">My Rental Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRentals.filter(r => ['pending', 'active'].includes(r.status)).map((rental) => (
                <div
                  key={rental.id}
                  className={`p-5 rounded-2xl border shadow-sm ${
                    rental.status === 'pending'
                      ? 'bg-amber-50/50 border-amber-200/60'
                      : 'bg-emerald-50/50 border-emerald-200/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {rental.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="text-base font-extrabold text-slate-900">{rental.space_number}</span>
                    </div>
                    <StatusBadge status={rental.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{rental.location}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                    <span>Start: <strong className="text-slate-700">{rental.start_date}</strong></span>
                    <span>End: <strong className="text-slate-700">{rental.end_date || 'N/A'}</strong></span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-primary-600">{formatCurrency(rental.monthly_rate)} / yr</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
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
            <option value="reserved">Reserved</option>
            <option value="rented">Rented</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              {/* Stall Photo */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={getSpaceImageUrl(s.image, s.space_number)}
                  alt={s.space_number}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={s.status} />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-white">
                  {s.space_number}
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-800">{s.location}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{s.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Size: <strong className="text-slate-700">{s.size_sqm} sqm</strong></span>
                  <span className="text-primary-600 font-extrabold text-sm">{formatCurrency(s.monthly_rate)} / yr</span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setSelectedSpace(s)}
                    className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-600 font-bold text-xs border border-slate-200 hover:border-primary-200 transition flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  {isAvailable(s.status) ? (
                    <button
                      onClick={() => openRentModal(s)}
                      disabled={hasPendingRental}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                        hasPendingRental
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>{hasPendingRental ? 'Pending Request Exists' : 'Rent Now'}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200 flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Unavailable</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Details Modal */}
        <Modal isOpen={!!selectedSpace} onClose={() => setSelectedSpace(null)} title={`Space Detail — ${selectedSpace?.space_number}`}>
          {selectedSpace && (
            <div className="space-y-4">
              <div className="w-full h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={getSpaceImageUrl(selectedSpace.image, selectedSpace.space_number)}
                  alt={selectedSpace.space_number}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                <StatusBadge status={selectedSpace.status} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                <p className="text-base font-bold text-slate-900">{selectedSpace.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Size (sqm)</label>
                  <p className="text-lg font-extrabold text-slate-900">{selectedSpace.size_sqm} sqm</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Rate</label>
                  <p className="text-lg font-extrabold text-primary-600">{formatCurrency(selectedSpace.monthly_rate)} / year</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                <p className="text-sm text-slate-600 mt-1">{selectedSpace.description}</p>
              </div>

              {/* Rent Now action in modal */}
              <div className="pt-4 border-t border-slate-100">
                {isAvailable(selectedSpace.status) && !hasPendingRental ? (
                  <button
                    onClick={() => {
                      const tgt = selectedSpace;
                      setSelectedSpace(null);
                      openRentModal(tgt);
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition flex items-center justify-center space-x-2"
                  >
                    <Store className="w-5 h-5" />
                    <span>Rent This Space</span>
                  </button>
                ) : isAvailable(selectedSpace.status) && hasPendingRental ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed"
                  >
                    You already have a pending rental request
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed"
                  >
                    This Space is Currently {selectedSpace.status.charAt(0).toUpperCase() + selectedSpace.status.slice(1)}
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Rental Request Modal */}
        <Modal
          isOpen={isRentModalOpen}
          onClose={() => setIsRentModalOpen(false)}
          title={`Rent Space — ${rentTarget?.space_number}`}
        >
          {rentTarget && (
            <form onSubmit={handleRentSubmit} className="space-y-6">
              {/* Space Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src={getSpaceImageUrl(rentTarget.image, rentTarget.space_number)}
                    alt={rentTarget.space_number}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Selected Market Stall</p>
                  <p className="text-lg font-black text-slate-900">{rentTarget.space_number}</p>
                  <p className="text-sm font-medium text-slate-600">{rentTarget.location}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-xs text-slate-400">Size: <strong className="text-slate-700">{rentTarget.size_sqm} sqm</strong></span>
                  <span className="text-sm font-extrabold text-primary-600">{formatCurrency(rentTarget.monthly_rate)} / year</span>
                </div>
              </div>

              {/* Rental Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Desired Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: 1 year from start date</p>
                </div>
              </div>

              {/* Info Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-800 font-medium">
                <strong>Note:</strong> Your rental request will be submitted for admin review. The space will be reserved for you while pending approval.
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRentModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition flex items-center space-x-2 ${
                    isSubmitting
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Rental Request</span>
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
