import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Eye,
  EyeOff,
  Store,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  History,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  DollarSign,
  Receipt,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  FolderOpen
} from 'lucide-react';

// Injects the market's type system once, without touching index.html
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

const AdminRenters = () => {
  useMarketFonts();
  const [renters, setRenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPassMap, setShowPassMap] = useState({});
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [activeTab, setActiveTab] = useState('spaces'); // 'spaces' | 'billings' | 'payments'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'multiple' | 'unpaid' | 'active'
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchRenters();
  }, [search]);

  const fetchRenters = async () => {
    try {
      const res = await api.get(`/users/renters?search=${encodeURIComponent(search)}`);
      setRenters(res.data || []);
    } catch (error) {
      console.error('Error fetching renters:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (id) => {
    setShowPassMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openRenterHistory = (renter, initialTab = 'spaces') => {
    setSelectedRenter(renter);
    setActiveTab(initialTab);
  };

  const filteredRenters = renters.filter(r => {
    if (filterType === 'multiple') return (r.rentals?.length || 0) >= 2;
    if (filterType === 'unpaid') return (r.unpaid_balance || 0) > 0;
    if (filterType === 'active') return (r.active_spaces_count || 0) > 0;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Renters & Rental History</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0F3D37]/10 text-[#0F3D37] text-xs font-bold border border-[#0F3D37]/20 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Single Profile • Multi-Space History</span>
              </span>
            </div>
            <p className="text-sm text-[#241C15]/60 font-medium mt-0.5">
              Each renter has one single profile. If they rent 2 or more spaces, all rental records, contracts, billings, and payments appear unified under their single history.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#241C15]/10 text-xs font-bold text-[#241C15] shadow-sm">
              Total Renters: <strong className="text-[#C1440E]" style={monoStyle}>{renters.length}</strong>
            </span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search renter by name, email, phone, or stall number (e.g. BLK-101)..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#241C15] text-[#FBF6EA] shadow-sm'
                  : 'bg-[#F6EFDE] text-[#241C15]/70 hover:bg-[#241C15]/10'
              }`}
            >
              All Renters ({renters.length})
            </button>
            <button
              onClick={() => setFilterType('multiple')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                filterType === 'multiple'
                  ? 'bg-[#0F3D37] text-[#FBF6EA] shadow-sm'
                  : 'bg-[#F6EFDE] text-[#241C15]/70 hover:bg-[#241C15]/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#E8A33D]" />
              <span>Multi-Space Renters ({renters.filter(r => (r.rentals?.length || 0) >= 2).length})</span>
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                filterType === 'active'
                  ? 'bg-[#0F3D37] text-[#FBF6EA] shadow-sm'
                  : 'bg-[#F6EFDE] text-[#241C15]/70 hover:bg-[#241C15]/10'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Active Leases</span>
            </button>
            <button
              onClick={() => setFilterType('unpaid')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                filterType === 'unpaid'
                  ? 'bg-[#C1440E] text-[#FBF6EA] shadow-sm'
                  : 'bg-[#F6EFDE] text-[#241C15]/70 hover:bg-[#241C15]/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unpaid (Blocked)</span>
            </button>
          </div>
        </div>

        {/* Renters Consolidated Table */}
        <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                  <th className="py-4 px-6">Renter Profile</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Assigned Spaces & History</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6">Password</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[#241C15]/40 font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-[#C1440E] border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading unified renter profiles...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRenters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[#241C15]/40 font-medium">
                      No renter records found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredRenters.map((r) => {
                    const allRentals = r.rentals || [];
                    const activeCount = r.active_spaces_count || 0;
                    const hasUnpaid = (r.unpaid_balance || 0) > 0;
                    const isMultiSpace = allRentals.length >= 2;
                    const isExpanded = expandedRows[r.id];

                    return (
                      <React.Fragment key={r.id}>
                        <tr className={`hover:bg-[#F6EFDE]/40 transition ${isExpanded ? 'bg-[#F6EFDE]/30' : ''}`}>
                          {/* Profile */}
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                                isMultiSpace
                                  ? 'bg-[#0F3D37] text-[#FBF6EA]'
                                  : 'bg-[#0F3D37]/10 text-[#0F3D37]'
                              }`}>
                                {r.first_name?.charAt(0) || 'R'}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <p className="font-bold text-[#241C15]">{r.first_name} {r.middle_name ? `${r.middle_name} ` : ''}{r.last_name}</p>
                                  {isMultiSpace && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#E8A33D]/20 text-[#8a5f1f] text-[10px] font-black uppercase tracking-tight flex items-center space-x-0.5" title="Multiple spaces held under this single profile">
                                      <Layers className="w-2.5 h-2.5" />
                                      <span>2+ Spaces</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span className="text-[11px] text-[#241C15]/50 font-mono">ID #{String(r.id).padStart(4, '0')}</span>
                                  <StatusBadge status={r.approval_status} />
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#241C15]/75 flex items-center">
                                <Mail className="w-3.5 h-3.5 mr-1.5 text-[#241C15]/35 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">{r.email}</span>
                              </p>
                              <p className="text-xs text-[#241C15]/55 flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-1.5 text-[#241C15]/35 flex-shrink-0" />
                                <span>{r.contact_number || 'N/A'}</span>
                              </p>
                            </div>
                          </td>

                          {/* Assigned Spaces & History Summary */}
                          <td className="py-4 px-6">
                            <div className="space-y-1.5">
                              {allRentals.length === 0 ? (
                                <span className="text-xs text-[#241C15]/35 italic flex items-center space-x-1">
                                  <span>No spaces rented</span>
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    {allRentals.slice(0, 3).map((rental) => (
                                      <span
                                        key={rental.id}
                                        className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                                          rental.status === 'active'
                                            ? 'bg-[#0F3D37]/10 text-[#0F3D37] border border-[#0F3D37]/20'
                                            : rental.status === 'pending'
                                            ? 'bg-[#E8A33D]/15 text-[#8a5f1f] border border-[#E8A33D]/30'
                                            : 'bg-[#241C15]/5 text-[#241C15]/50 border border-[#241C15]/10'
                                        }`}
                                      >
                                        <Store className="w-3 h-3" />
                                        <span>{rental.space_number}</span>
                                        <span className="text-[10px] font-normal opacity-75">({rental.status})</span>
                                      </span>
                                    ))}
                                    {allRentals.length > 3 && (
                                      <span className="text-[11px] font-bold text-[#C1440E] bg-[#C1440E]/10 px-1.5 py-0.5 rounded-md">
                                        +{allRentals.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-[11px] text-[#241C15]/50 font-medium">
                                    <span className="font-bold text-[#241C15]/70 flex items-center space-x-1">
                                      <Layers className="w-3 h-3 text-[#C1440E]" />
                                      <span>{allRentals.length} Space Record{allRentals.length === 1 ? '' : 's'}</span>
                                    </span>
                                    <span>•</span>
                                    <span>{activeCount} Active</span>
                                    <button
                                      onClick={() => toggleRowExpand(r.id)}
                                      className="text-[#C1440E] hover:underline font-bold ml-1 inline-flex items-center text-[10px] cursor-pointer"
                                    >
                                      {isExpanded ? (
                                        <>Hide Breakdown <ChevronUp className="w-3 h-3 ml-0.5" /></>
                                      ) : (
                                        <>Quick Breakdown <ChevronDown className="w-3 h-3 ml-0.5" /></>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Payment Status */}
                          <td className="py-4 px-6">
                            {hasUnpaid ? (
                              <div className="inline-flex flex-col">
                                <span className="px-2.5 py-1 rounded-lg bg-[#C1440E]/10 text-[#C1440E] border border-[#C1440E]/20 text-xs font-bold flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Unpaid: {formatCurrency(r.unpaid_balance)}</span>
                                </span>
                                <span className="text-[10px] text-[#C1440E] font-medium mt-0.5">Reservations blocked</span>
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#0F3D37]/10 text-[#0F3D37] border border-[#0F3D37]/20 text-xs font-bold inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Good Standing (Paid)</span>
                              </span>
                            )}
                          </td>

                          {/* Password Access */}
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-[#241C15]/70" style={monoStyle}>
                                {showPassMap[r.id] ? (r.password_plain || 'Encrypted') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePassword(r.id)}
                                className="p-1 text-[#241C15]/35 hover:text-[#241C15]/70 rounded transition cursor-pointer"
                                title="Toggle password reveal"
                              >
                                {showPassMap[r.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => openRenterHistory(r, 'spaces')}
                              className="px-3.5 py-1.5 rounded-xl bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] font-bold text-xs shadow-sm transition inline-flex items-center space-x-1.5 cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5 text-[#E8A33D]" />
                              <span>View Rental History ({allRentals.length})</span>
                            </button>
                          </td>
                        </tr>

                        {/* Inline Expandable Space Breakdown Drawer for this Renter */}
                        {isExpanded && (
                          <tr className="bg-[#F6EFDE]/40 border-b border-[#241C15]/10 animate-in fade-in">
                            <td colSpan="6" className="py-4 px-8">
                              <div className="p-4 rounded-xl bg-white border border-[#241C15]/10 shadow-inner space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Layers className="w-4 h-4 text-[#C1440E]" />
                                    <span className="text-xs font-bold text-[#241C15] uppercase tracking-wide">
                                      {r.first_name}'s Spaces Breakdown ({allRentals.length} Stall{allRentals.length === 1 ? '' : 's'} Assigned)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => openRenterHistory(r, 'spaces')}
                                    className="text-xs font-bold text-[#0F3D37] hover:underline flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span>Open Full Details & Statements</span>
                                    <History className="w-3 h-3" />
                                  </button>
                                </div>

                                {allRentals.length === 0 ? (
                                  <p className="text-xs text-[#241C15]/50 italic">No spaces assigned.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {allRentals.map((rental) => (
                                      <div
                                        key={rental.id}
                                        className="p-3 rounded-lg border border-[#241C15]/10 bg-[#FBF6EA]/60 flex items-start space-x-3 text-xs"
                                      >
                                        <div className="p-2 rounded-lg bg-[#241C15] text-[#FBF6EA] font-bold text-center">
                                          <Store className="w-3.5 h-3.5 text-[#E8A33D] mx-auto" />
                                          <span className="text-[10px] mt-0.5 block">{rental.space_number}</span>
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-[#241C15]">{rental.location}</span>
                                            <StatusBadge status={rental.status} />
                                          </div>
                                          <p className="text-[#241C15]/60 text-[11px]">
                                            Term: {rental.start_date} → {rental.end_date || '6 Mos+'}
                                          </p>
                                          <p className="text-[#C1440E] font-bold" style={monoStyle}>
                                            Rate: {formatCurrency(rental.monthly_rate)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consolidated Renter Profile & Multi-Space Rental History Modal */}
        <Modal
          isOpen={!!selectedRenter}
          onClose={() => setSelectedRenter(null)}
          title={`Renter Profile & Rental History — ${selectedRenter?.first_name} ${selectedRenter?.last_name}`}
          maxWidth="max-w-4xl"
        >
          {selectedRenter && (
            <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {/* Unified Profile Header Card */}
              <div className="p-5 rounded-2xl bg-[#F6EFDE] border border-[#241C15]/10 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0F3D37] text-[#FBF6EA] flex items-center justify-center font-bold text-lg shadow-md shadow-[#0F3D37]/20">
                      {selectedRenter.first_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-[#241C15]">
                          {selectedRenter.first_name} {selectedRenter.middle_name ? `${selectedRenter.middle_name} ` : ''}{selectedRenter.last_name}
                        </h3>
                        {(selectedRenter.rentals?.length || 0) >= 2 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#0F3D37] text-[#FBF6EA] text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                            <Layers className="w-3 h-3 text-[#E8A33D]" />
                            <span>Multi-Space Renter ({selectedRenter.rentals.length} Stalls)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#241C15]/60 font-medium flex items-center space-x-2 mt-0.5">
                        <span>Account ID #{String(selectedRenter.id).padStart(4, '0')}</span>
                        <span>•</span>
                        <span>Member Since: {formatDate(selectedRenter.created_at)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={selectedRenter.approval_status} />
                    <StatusBadge status={selectedRenter.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#241C15]/10 text-xs">
                  <div>
                    <span className="text-[#241C15]/40 font-bold uppercase block text-[10px]">Email Address</span>
                    <span className="text-[#241C15] font-semibold">{selectedRenter.email}</span>
                  </div>
                  <div>
                    <span className="text-[#241C15]/40 font-bold uppercase block text-[10px]">Contact Number</span>
                    <span className="text-[#241C15] font-semibold">{selectedRenter.contact_number || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#241C15]/40 font-bold uppercase block text-[10px]">Physical Address</span>
                    <span className="text-[#241C15] font-semibold">{selectedRenter.address || 'Duero, Bohol'}</span>
                  </div>
                </div>
              </div>

              {/* Financial & Space Summary Deck */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#241C15]/8 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[#241C15]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Stalls</span>
                    <Layers className="w-3.5 h-3.5 text-[#C1440E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#241C15]" style={monoStyle}>{selectedRenter.rentals?.length || 0}</p>
                  <p className="text-[11px] text-[#0F3D37] font-semibold">{selectedRenter.active_spaces_count || 0} active leased</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#241C15]/8 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[#241C15]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Rent Value</span>
                    <Store className="w-3.5 h-3.5 text-[#0F3D37]" />
                  </div>
                  <p className="text-xl font-bold text-[#241C15]" style={monoStyle}>
                    {formatCurrency(
                      (selectedRenter.rentals || []).reduce((sum, r) => sum + parseFloat(r.monthly_rate || 0), 0)
                    )}
                  </p>
                  <p className="text-[11px] text-[#241C15]/50">Across all stalls</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#241C15]/8 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[#241C15]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Paid to Date</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#0F3D37]" />
                  </div>
                  <p className="text-xl font-bold text-[#0F3D37]" style={monoStyle}>{formatCurrency(selectedRenter.total_paid || 0)}</p>
                  <p className="text-[11px] text-[#241C15]/50">{selectedRenter.payments?.length || 0} transactions</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#241C15]/8 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-[#241C15]/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Unpaid Balance</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C1440E]" />
                  </div>
                  <p className={`text-xl font-bold ${(selectedRenter.unpaid_balance || 0) > 0 ? 'text-[#C1440E]' : 'text-[#0F3D37]'}`} style={monoStyle}>
                    {formatCurrency(selectedRenter.unpaid_balance || 0)}
                  </p>
                  <p className="text-[11px] font-bold" style={{ color: (selectedRenter.unpaid_balance || 0) > 0 ? '#C1440E' : '#0F3D37' }}>
                    {(selectedRenter.unpaid_balance || 0) > 0 ? '⚠ New Bookings Blocked' : '✓ Good Standing (Paid)'}
                  </p>
                </div>
              </div>

              {/* Multi-space notification banner */}
              {(selectedRenter.rentals?.length || 0) >= 2 && (
                <div className="p-3.5 rounded-xl bg-[#0F3D37]/10 border border-[#0F3D37]/20 flex items-center space-x-3 text-xs text-[#0F3D37]">
                  <div className="p-2 rounded-lg bg-[#0F3D37] text-[#FBF6EA]">
                    <Layers className="w-4 h-4 text-[#E8A33D]" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold">Consolidated Multi-Space Renter History</strong>
                    <span>
                      This renter occupies {selectedRenter.rentals.length} separate spaces ({selectedRenter.rentals.map(r => r.space_number).join(', ')}). All space records, contracts, billings, and payment transactions are unified under this single history.
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#241C15]/10 space-x-3">
                <button
                  onClick={() => setActiveTab('spaces')}
                  className={`pb-3 px-1 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'spaces'
                      ? 'border-[#C1440E] text-[#C1440E]'
                      : 'border-transparent text-[#241C15]/50 hover:text-[#241C15]'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>All Rented Spaces ({selectedRenter.rentals?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('billings')}
                  className={`pb-3 px-1 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'billings'
                      ? 'border-[#C1440E] text-[#C1440E]'
                      : 'border-transparent text-[#241C15]/50 hover:text-[#241C15]'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Billing Statements ({selectedRenter.billings?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`pb-3 px-1 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'payments'
                      ? 'border-[#C1440E] text-[#C1440E]'
                      : 'border-transparent text-[#241C15]/50 hover:text-[#241C15]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Receipts ({selectedRenter.payments?.length || 0})</span>
                </button>
              </div>

              {/* Tab 1: All Rented Spaces & Lease History */}
              {activeTab === 'spaces' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#241C15]/60 font-medium">
                      All stall reservations & active contracts in this renter's history:
                    </p>
                    <span className="text-[11px] text-[#241C15]/50 font-semibold bg-[#F6EFDE] px-2.5 py-1 rounded-lg">
                      Policy: <strong>6-Month Minimum Lease Term</strong>
                    </span>
                  </div>

                  {(!selectedRenter.rentals || selectedRenter.rentals.length === 0) ? (
                    <div className="py-10 text-center bg-[#F6EFDE]/50 rounded-xl border border-dashed border-[#241C15]/15 text-xs text-[#241C15]/50 space-y-1">
                      <Store className="w-8 h-8 mx-auto text-[#241C15]/30 mb-2" />
                      <p className="font-bold">No spaces rented yet.</p>
                      <p>This renter currently has zero stall reservations or historical records.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRenter.rentals.map((rental, idx) => (
                        <div
                          key={rental.id}
                          className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            rental.status === 'active'
                              ? 'bg-[#0F3D37]/5 border-[#0F3D37]/25 shadow-sm'
                              : rental.status === 'pending'
                              ? 'bg-[#E8A33D]/10 border-[#E8A33D]/30'
                              : 'bg-white border-[#241C15]/10'
                          }`}
                        >
                          <div className="flex items-start space-x-3.5">
                            {/* Stall Badge */}
                            <div className="p-3 rounded-xl bg-[#241C15] text-[#FBF6EA] font-bold text-xs flex flex-col items-center justify-center min-w-[58px] shadow-sm">
                              <Store className="w-4 h-4 text-[#E8A33D]" />
                              <span className="mt-1 font-mono">{rental.space_number}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-[#241C15] text-sm">{rental.space_number} — {rental.location}</h4>
                                <StatusBadge status={rental.status} />
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#241C15]/10 font-bold text-[#241C15]/70">
                                  Space #{idx + 1}
                                </span>
                              </div>

                              <p className="text-xs text-[#241C15]/70 flex items-center space-x-3 flex-wrap gap-y-1">
                                <span className="flex items-center">
                                  <Calendar className="w-3.5 h-3.5 mr-1 text-[#241C15]/40" />
                                  Lease Term: <strong>{rental.start_date}</strong> to <strong>{rental.end_date || '6 Months+'}</strong>
                                </span>
                                <span>•</span>
                                <span>Floor Size: <strong>{rental.size_sqm} sqm</strong></span>
                              </p>

                              <p className="text-xs font-bold text-[#C1440E]" style={monoStyle}>
                                Annual Rate: {formatCurrency(rental.monthly_rate)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right text-xs space-y-1">
                            <span className="text-[10px] text-[#241C15]/40 uppercase font-bold block">
                              Rental Contract #{rental.id}
                            </span>
                            <span className="text-[#241C15]/60 font-medium">Booked: {formatDate(rental.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Billings */}
              {activeTab === 'billings' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#241C15]/60 font-medium">
                    Itemized billing statements across all rented stalls for this profile:
                  </p>
                  {(!selectedRenter.billings || selectedRenter.billings.length === 0) ? (
                    <div className="py-8 text-center bg-[#F6EFDE]/50 rounded-xl border border-dashed border-[#241C15]/15 text-xs text-[#241C15]/50">
                      No billing statements generated for this renter yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#241C15]/8 border border-[#241C15]/8 rounded-xl bg-white overflow-hidden text-xs">
                      {selectedRenter.billings.map((b) => (
                        <div key={b.id} className="p-3.5 flex items-center justify-between hover:bg-[#F6EFDE]/40 transition">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-[#241C15] text-[#FBF6EA] font-mono font-bold text-[10px]">
                                {b.space_number}
                              </span>
                              <p className="font-bold text-[#241C15]">Billing Month: {b.billing_month}</p>
                            </div>
                            <p className="text-[#241C15]/50 mt-0.5 text-[11px]">Due Date: {b.due_date} • Statement #{b.id}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-[#241C15]" style={monoStyle}>
                              Balance: <span className={parseFloat(b.balance || 0) > 0 ? 'text-[#C1440E]' : 'text-[#0F3D37]'}>{formatCurrency(b.balance)}</span> / Due: {formatCurrency(b.amount_due)}
                            </p>
                            <StatusBadge status={b.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Payments */}
              {activeTab === 'payments' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#241C15]/60 font-medium">
                    Official receipt records of all payments collected from this renter:
                  </p>
                  {(!selectedRenter.payments || selectedRenter.payments.length === 0) ? (
                    <div className="py-8 text-center bg-[#F6EFDE]/50 rounded-xl border border-dashed border-[#241C15]/15 text-xs text-[#241C15]/50">
                      No payment receipts recorded for this renter yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#241C15]/8 border border-[#241C15]/8 rounded-xl bg-white overflow-hidden text-xs">
                      {selectedRenter.payments.map((p) => (
                        <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-[#F6EFDE]/40 transition">
                          <div>
                            <p className="font-bold text-[#241C15]">Official Receipt #{p.reference_number || `OR-${p.id}`}</p>
                            <p className="text-[#241C15]/50 mt-0.5">
                              {formatDate(p.payment_date)} • Method: {p.payment_method} • Type: {p.payment_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#0F3D37] text-sm" style={monoStyle}>
                              +{formatCurrency(p.amount_paid)}
                            </p>
                            <p className="text-[10px] text-[#241C15]/50">Balance After: {formatCurrency(p.balance_after)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRenter(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#241C15]/10 hover:bg-[#241C15]/15 text-[#241C15] font-bold text-xs transition cursor-pointer"
                >
                  Close Profile & History
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminRenters;
