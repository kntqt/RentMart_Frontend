import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import { Search, Eye, Store, Lock, Calendar, CheckCircle, Clock } from 'lucide-react';

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
const modalLabelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1";
const modalInputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";

const RenterSpaces = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [rentTarget, setRentTarget] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      fetchSpaces();
      fetchMyRentals();
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error submitting rental request. Please try again.';
      setFlash({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingRental = myRentals.some(r => r.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Browse Duero Market Spaces</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Explore all available commercial stalls in Duero Public Market.</p>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* My Active Rentals Summary */}
        {myRentals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#241C15]/70 uppercase tracking-wider">My Rental Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRentals.filter(r => ['pending', 'active'].includes(r.status)).map((rental) => (
                <div
                  key={rental.id}
                  className={`p-5 rounded-xl border shadow-sm ${
                    rental.status === 'pending'
                      ? 'bg-[#E8A33D]/8 border-[#E8A33D]/30'
                      : 'bg-[#0F3D37]/5 border-[#0F3D37]/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {rental.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-[#E8A33D]" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-[#0F3D37]" />
                      )}
                      <span className="text-base font-bold text-[#241C15]">{rental.space_number}</span>
                    </div>
                    <StatusBadge status={rental.status} />
                  </div>
                  <p className="text-xs text-[#241C15]/60 font-medium">{rental.location}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-[#241C15]/50">
                    <span>Start: <strong className="text-[#241C15]">{rental.start_date}</strong></span>
                    <span>End: <strong className="text-[#241C15]">{rental.end_date || 'N/A'}</strong></span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(rental.monthly_rate)} / yr</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
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
          </select>
        </div>

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
                    className="w-full py-2.5 rounded-xl bg-[#241C15]/5 hover:bg-[#0F3D37] hover:text-[#FBF6EA] text-[#241C15] font-bold text-xs border border-[#241C15]/10 hover:border-[#0F3D37] transition flex items-center justify-center space-x-2"
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
                          ? 'bg-[#241C15]/10 text-[#241C15]/40 cursor-not-allowed border border-[#241C15]/8'
                          : 'bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] shadow-md shadow-[#C1440E]/20'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>{hasPendingRental ? 'Pending Request Exists' : 'Rent Now'}</span>
                    </button>
                  ) : (
                    <button disabled className="w-full py-2.5 rounded-xl bg-[#241C15]/10 text-[#241C15]/40 font-bold text-xs cursor-not-allowed border border-[#241C15]/8 flex items-center justify-center space-x-2">
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
              <div className="w-full h-52 rounded-xl overflow-hidden bg-[#F6EFDE] border border-[#241C15]/8">
                <img src={getSpaceImageUrl(selectedSpace.image, selectedSpace.space_number)} alt={selectedSpace.space_number} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[#241C15]/40 font-bold uppercase">Status</span>
                <StatusBadge status={selectedSpace.status} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Location</label>
                <p className="text-base font-bold text-[#241C15]">{selectedSpace.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-[#F6EFDE] p-4 rounded-xl border-2 border-dashed border-[#C1440E]/20">
                <div>
                  <label className="text-xs font-bold text-[#241C15]/40 uppercase">Size (sqm)</label>
                  <p className="text-lg font-bold text-[#241C15]">{selectedSpace.size_sqm} sqm</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#241C15]/40 uppercase">Rate</label>
                  <p className="text-lg font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(selectedSpace.monthly_rate)} / year</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#241C15]/40 uppercase">Description</label>
                <p className="text-sm text-[#241C15]/60 mt-1">{selectedSpace.description}</p>
              </div>

              <div className="pt-4 border-t border-[#241C15]/8">
                {isAvailable(selectedSpace.status) && !hasPendingRental ? (
                  <button
                    onClick={() => {
                      const tgt = selectedSpace;
                      setSelectedSpace(null);
                      openRentModal(tgt);
                    }}
                    className="w-full py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/30 transition flex items-center justify-center space-x-2"
                  >
                    <Store className="w-5 h-5" />
                    <span>Rent This Space</span>
                  </button>
                ) : isAvailable(selectedSpace.status) && hasPendingRental ? (
                  <button disabled className="w-full py-3 rounded-xl bg-[#241C15]/10 text-[#241C15]/50 font-bold text-sm cursor-not-allowed">
                    You already have a pending rental request
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

        {/* Rental Request Modal */}
        <Modal isOpen={isRentModalOpen} onClose={() => setIsRentModalOpen(false)} title={`Rent Space — ${rentTarget?.space_number}`}>
          {rentTarget && (
            <form onSubmit={handleRentSubmit} className="space-y-6">
              <div className="bg-[#F6EFDE] p-4 rounded-xl border border-[#241C15]/8 space-y-3">
                <div className="w-full h-36 rounded-lg overflow-hidden bg-[#241C15]/5">
                  <img src={getSpaceImageUrl(rentTarget.image, rentTarget.space_number)} alt={rentTarget.space_number} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-[#241C15]/40 font-bold uppercase">Selected Market Stall</p>
                  <p className="text-lg font-bold text-[#241C15]">{rentTarget.space_number}</p>
                  <p className="text-sm font-medium text-[#241C15]/60">{rentTarget.location}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#241C15]/10 mt-2">
                  <span className="text-xs text-[#241C15]/40">Size: <strong className="text-[#241C15]">{rentTarget.size_sqm} sqm</strong></span>
                  <span className="text-sm font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(rentTarget.monthly_rate)} / year</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={modalLabelClass}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Desired Start Date *
                  </label>
                  <input type="date" required value={startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setStartDate(e.target.value)} className={modalInputClass} />
                </div>
                <div>
                  <label className={modalLabelClass}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    End Date (Optional)
                  </label>
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={modalInputClass} />
                  <p className="text-[10px] text-[#241C15]/40 mt-1">Default: 1 year from start date</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#E8A33D]/8 border border-[#E8A33D]/25 text-xs text-[#8a5f1f] font-medium">
                <strong>Note:</strong> Your rental request will be submitted for admin review. The space will be reserved for you while pending approval.
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsRentModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm hover:bg-[#241C15]/12 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition flex items-center space-x-2 ${
                    isSubmitting
                      ? 'bg-[#241C15]/30 text-[#241C15]/50 cursor-not-allowed'
                      : 'bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] shadow-[#C1440E]/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#FBF6EA]/30 border-t-[#FBF6EA] rounded-full animate-spin"></div>
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
