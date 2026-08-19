import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import { Plus, Search, Check, X, Edit, Store, ShieldAlert, Layers, Ban, CheckCircle } from 'lucide-react';

const AdminSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    space_number: '',
    location: '',
    size_sqm: '',
    monthly_rate: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchSpaces();
    fetchPendingRentals();
    fetchActiveRentals();
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${search}`);
      setSpaces(res.data.spaces || []);
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/spaces', formData);
      setFlash({ type: 'success', message: 'New market space created.' });
      setIsCreateOpen(false);
      resetForm();
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error creating space.' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/spaces/${selectedSpace.id}`, formData);
      setFlash({ type: 'success', message: 'Space details updated.' });
      setIsEditOpen(false);
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error updating space.' });
    }
  };

  const openEditModal = (s) => {
    setSelectedSpace(s);
    setFormData({
      space_number: s.space_number,
      location: s.location || '',
      size_sqm: s.size_sqm || '',
      monthly_rate: s.monthly_rate || '',
      status: s.status,
      description: s.description || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      space_number: '',
      location: '',
      size_sqm: '',
      monthly_rate: '',
      status: 'available',
      description: ''
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Space Inventory</h1>
            <p className="text-sm text-slate-500 font-medium">Manage market stalls, rental rates, and pending lease assignments.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Market Space</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Pending Rental Approvals Queue */}
        {pendingRentals.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-4">
            <div className="flex items-center space-x-2 text-amber-700 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Pending Rental Approval Queue ({pendingRentals.length})</span>
            </div>

            <div className="divide-y divide-amber-500/20">
              {pendingRentals.map((pr) => (
                <div key={pr.rental_id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-extrabold text-slate-900">{pr.first_name} {pr.last_name} ({pr.email})</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Assigned to: <strong className="text-amber-800 font-bold">{pr.space_number}</strong> ({pr.location}) • Rate: {formatCurrency(pr.monthly_rate)}/yr
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApproveRental(pr.rental_id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Rental</span>
                    </button>
                    <button
                      onClick={() => handleRejectRental(pr.rental_id)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/20"
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
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-base">
              <Layers className="w-5 h-5" />
              <span>Active Rentals ({activeRentals.length})</span>
            </div>

            <div className="divide-y divide-blue-500/10">
              {activeRentals.map((ar) => (
                <div key={ar.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-extrabold text-slate-900">{ar.first_name} {ar.last_name} ({ar.email})</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Space: <strong className="text-blue-800 font-bold">{ar.space_number}</strong> ({ar.location}) • Rate: {formatCurrency(ar.monthly_rate)}/yr
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Period: {ar.start_date} → {ar.end_date || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCompleteRental(ar.id)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => handleCancelRental(ar.id)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-orange-600/20 transition"
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

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search space # or location..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700"
          >
            <option value="all">All Space Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
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

                <button
                  onClick={() => openEditModal(s)}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-600 font-bold text-xs border border-slate-200 hover:border-primary-200 transition flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Space Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Market Space">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Space Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. BLK-109"
              value={formData.space_number}
              onChange={(e) => setFormData({ ...formData, space_number: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Section</label>
            <input
              type="text"
              placeholder="Section A - Wet Market"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Size (sqm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yearly Rate (₱) *</label>
              <input
                type="number"
                required
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
              Create Market Space
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Market Space">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Space Number</label>
              <input
                type="text"
                required
                value={formData.space_number}
                onChange={(e) => setFormData({ ...formData, space_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <option value="available">available</option>
                <option value="reserved">reserved</option>
                <option value="rented">rented</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Size (sqm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Yearly Rate (₱)</label>
              <input
                type="number"
                required
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminSpaces;
