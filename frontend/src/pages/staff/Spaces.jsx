import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import { Search, UserCheck, Store, CheckCircle } from 'lucide-react';

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

const StaffSpaces = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [flash, setFlash] = useState({ type: '', message: '' });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
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
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Space Lease Assignment</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Browse available stalls and assign verified vendors.</p>
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
            <option value="rented">Rented</option>
          </select>
        </div>

        {/* Grid */}
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
                <div className="pt-1">
                  {s.status === 'available' ? (
                    <button onClick={() => openAssignModal(s)} className="w-full py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs shadow-md shadow-[#C1440E]/20 transition flex items-center justify-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Assign Renter</span>
                    </button>
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
              <button type="button" onClick={handleRenterLookup} className="px-5 py-2.5 rounded-lg bg-[#241C15] hover:bg-[#241C15]/90 text-[#FBF6EA] font-bold text-xs transition">
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
            <button type="button" onClick={() => setIsAssignOpen(false)} className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25">Submit Lease Assignment</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffSpaces;
