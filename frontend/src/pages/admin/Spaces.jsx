import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import { Plus, Search, Check, X, Edit, Store, ShieldAlert, Layers, Ban, CheckCircle, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

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
const modalInputClass = "w-full px-4 py-2.5 rounded-lg border border-[#241C15]/15 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E] transition";
const modalLabelClass = "block text-xs font-bold text-[#241C15]/50 uppercase mb-1";

const AdminSpaces = () => {
  useMarketFonts();
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

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const createFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('space_number', formData.space_number);
      data.append('location', formData.location);
      data.append('size_sqm', formData.size_sqm);
      data.append('monthly_rate', formData.monthly_rate);
      data.append('status', formData.status);
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/spaces', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFlash({ type: 'success', message: 'New market space created successfully.' });
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
      const data = new FormData();
      data.append('space_number', formData.space_number);
      data.append('location', formData.location);
      data.append('size_sqm', formData.size_sqm);
      data.append('monthly_rate', formData.monthly_rate);
      data.append('status', formData.status);
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.put(`/spaces/${selectedSpace.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFlash({ type: 'success', message: 'Space details updated successfully.' });
      setIsEditOpen(false);
      resetForm();
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
    setImageFile(null);
    setImagePreview(s.image ? getSpaceImageUrl(s.image, s.space_number) : null);
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
    setImageFile(null);
    setImagePreview(null);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Space Inventory</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Manage market stalls, rental rates, picture showcases, and pending lease assignments.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Market Space</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Pending Rental Approvals Queue */}
        {pendingRentals.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#E8A33D]/8 border border-[#E8A33D]/30 space-y-4">
            <div className="flex items-center space-x-2 text-[#8a5f1f] font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Pending Rental Approval Queue ({pendingRentals.length})</span>
            </div>

            <div className="divide-y divide-[#E8A33D]/20">
              {pendingRentals.map((pr) => (
                <div key={pr.rental_id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#241C15]">{pr.first_name} {pr.last_name} ({pr.email})</p>
                    <p className="text-xs text-[#241C15]/60 font-medium mt-1">
                      Assigned to: <strong className="text-[#8a5f1f] font-bold">{pr.space_number}</strong> ({pr.location}) • Rate: {formatCurrency(pr.monthly_rate)}/yr
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApproveRental(pr.rental_id)}
                      className="px-4 py-2 rounded-xl bg-[#0F3D37] hover:bg-[#0c332e] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#0F3D37]/20 transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Rental</span>
                    </button>
                    <button
                      onClick={() => handleRejectRental(pr.rental_id)}
                      className="px-4 py-2 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#C1440E]/20 transition"
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
              <span>Active Rentals ({activeRentals.length})</span>
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
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden border border-[#241C15]/8 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
              <div className="relative h-44 w-full overflow-hidden bg-[#F6EFDE]">
                <img
                  src={getSpaceImageUrl(s.image, s.space_number)}
                  alt={s.space_number}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={s.status} />
                </div>
                <div className="absolute bottom-3 left-3 bg-[#241C15]/85 px-3 py-1 rounded-md text-xs font-black text-[#FBF6EA]">
                  {s.space_number}
                </div>
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

                <button
                  onClick={() => openEditModal(s)}
                  className="w-full py-2.5 rounded-xl bg-[#241C15]/5 hover:bg-[#0F3D37] hover:text-[#FBF6EA] text-[#241C15] font-bold text-xs border border-[#241C15]/10 hover:border-[#0F3D37] transition flex items-center justify-center space-x-2"
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
      <Modal isOpen={isCreateOpen} onClose={() => { resetForm(); setIsCreateOpen(false); }} title="Create Market Space">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Picture Upload Field */}
          <div>
            <label className={modalLabelClass}>Market Space Picture / Photo</label>
            <div className="flex items-center space-x-4 p-3 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10">
              {imagePreview ? (
                <div className="relative w-24 h-20 rounded-lg overflow-hidden border border-[#241C15]/15 flex-shrink-0 bg-white">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-[#C1440E] text-white rounded-md shadow hover:bg-[#a8390c] transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-20 rounded-lg border-2 border-dashed border-[#241C15]/20 flex flex-col items-center justify-center text-[#241C15]/40 flex-shrink-0 bg-white/50">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">No Image</span>
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={createFileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="create-space-image"
                />
                <label
                  htmlFor="create-space-image"
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#241C15] hover:bg-[#241C15]/90 text-[#FBF6EA] text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{imagePreview ? 'Change Photo' : 'Select Photo'}</span>
                </label>
                <p className="text-[11px] text-[#241C15]/50">Upload stall showcase picture (PNG, JPG, JPEG).</p>
              </div>
            </div>
          </div>

          <div>
            <label className={modalLabelClass}>Space Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. BLK-109"
              value={formData.space_number}
              onChange={(e) => setFormData({ ...formData, space_number: e.target.value })}
              className={modalInputClass}
            />
          </div>
          <div>
            <label className={modalLabelClass}>Location / Section</label>
            <input
              type="text"
              placeholder="Section A - Wet Market"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={modalInputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={modalLabelClass}>Size (sqm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                className={modalInputClass}
              />
            </div>
            <div>
              <label className={modalLabelClass}>Yearly Rate (₱) *</label>
              <input
                type="number"
                required
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className={modalInputClass + " font-semibold"}
              />
            </div>
          </div>
          <div>
            <label className={modalLabelClass}>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={modalInputClass}
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { resetForm(); setIsCreateOpen(false); }}
              className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm hover:bg-[#241C15]/12 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 transition"
            >
              Create Market Space
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { resetForm(); setIsEditOpen(false); }} title="Edit Market Space">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Picture Upload Field */}
          <div>
            <label className={modalLabelClass}>Market Space Picture / Photo</label>
            <div className="flex items-center space-x-4 p-3 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10">
              {imagePreview ? (
                <div className="relative w-24 h-20 rounded-lg overflow-hidden border border-[#241C15]/15 flex-shrink-0 bg-white">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-[#C1440E] text-white rounded-md shadow hover:bg-[#a8390c] transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-20 rounded-lg border-2 border-dashed border-[#241C15]/20 flex flex-col items-center justify-center text-[#241C15]/40 flex-shrink-0 bg-white/50">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">No Image</span>
                </div>
              )}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  id="edit-space-image"
                />
                <label
                  htmlFor="edit-space-image"
                  className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#241C15] hover:bg-[#241C15]/90 text-[#FBF6EA] text-xs font-bold cursor-pointer transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{imagePreview ? 'Change Photo' : 'Upload New Photo'}</span>
                </label>
                <p className="text-[11px] text-[#241C15]/50">Select a new picture to update stall showcase.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={modalLabelClass}>Space Number</label>
              <input
                type="text"
                required
                value={formData.space_number}
                onChange={(e) => setFormData({ ...formData, space_number: e.target.value })}
                className={modalInputClass}
              />
            </div>
            <div>
              <label className={modalLabelClass}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={modalInputClass + " font-semibold"}
              >
                <option value="available">available</option>
                <option value="reserved">reserved</option>
                <option value="rented">rented</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className={modalLabelClass}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={modalInputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={modalLabelClass}>Size (sqm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.size_sqm}
                onChange={(e) => setFormData({ ...formData, size_sqm: e.target.value })}
                className={modalInputClass}
              />
            </div>
            <div>
              <label className={modalLabelClass}>Yearly Rate (₱)</label>
              <input
                type="number"
                required
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className={modalInputClass + " font-semibold"}
              />
            </div>
          </div>
          <div>
            <label className={modalLabelClass}>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={modalInputClass}
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { resetForm(); setIsEditOpen(false); }}
              className="px-5 py-2.5 rounded-xl bg-[#241C15]/8 font-bold text-[#241C15]/70 text-sm hover:bg-[#241C15]/12 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminSpaces;
