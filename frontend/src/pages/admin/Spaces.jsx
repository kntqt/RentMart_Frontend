import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, getSpaceImageUrl } from '../../utils/formatters';
import {
  Plus,
  Search,
  Edit,
  Store,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  Building2,
  Layers,
  Clock,
  Wrench,
  AlertCircle
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

const AdminSpaces = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, reserved: 0, maintenance: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [statusFilter, search]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spaces?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      setSpaces(res.data.spaces || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setFlash({ type: 'error', message: 'Failed to load market spaces.' });
    } finally {
      setLoading(false);
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
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('space_number', formData.space_number.trim());
      data.append('location', formData.location.trim());
      data.append('size_sqm', formData.size_sqm);
      data.append('monthly_rate', formData.monthly_rate);
      data.append('status', formData.status);
      data.append('description', formData.description.trim());
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/spaces', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFlash({ type: 'success', message: `Market space '${formData.space_number}' created successfully.` });
      setIsCreateOpen(false);
      resetForm();
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error creating space.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSpace) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('space_number', formData.space_number.trim());
      data.append('location', formData.location.trim());
      data.append('size_sqm', formData.size_sqm);
      data.append('monthly_rate', formData.monthly_rate);
      data.append('status', formData.status);
      data.append('description', formData.description.trim());
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.put(`/spaces/${selectedSpace.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFlash({ type: 'success', message: `Space '${formData.space_number}' updated successfully.` });
      setIsEditOpen(false);
      resetForm();
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error updating space.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/spaces/${selectedSpace.id}`);
      setFlash({ type: 'success', message: `Market space '${selectedSpace.space_number}' deleted successfully.` });
      setIsDeleteOpen(false);
      setSelectedSpace(null);
      fetchSpaces();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error deleting space.' });
    } finally {
      setIsSubmitting(false);
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

  const openDeleteModal = (s) => {
    setSelectedSpace(s);
    setIsDeleteOpen(true);
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
    setSelectedSpace(null);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Header with Create Market Space button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Spaces</h1>
            <p className="text-sm text-[#241C15]/50 font-medium">Manage market stalls, lease rates, picture showcases, and add new spaces.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="px-6 py-3 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Create Market Space</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

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

        {/* Filter and Search Bar */}
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
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm font-semibold text-[#241C15]/80 focus:outline-none cursor-pointer"
          >
            <option value="all">All Space Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Spaces Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#241C15]/50">
            <div className="w-8 h-8 border-3 border-[#C1440E] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-semibold text-sm">Loading market spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#241C15]/8 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F6EFDE] flex items-center justify-center mx-auto text-[#241C15]/40">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241C15]">No market spaces found</h3>
              <p className="text-xs text-[#241C15]/50 mt-1">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search query or filter.'
                  : 'Start by creating your first market space.'}
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setIsCreateOpen(true); }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-xs shadow-md shadow-[#C1440E]/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Market Space</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {spaces.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#241C15]/8 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
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
                    <p className="text-sm font-bold text-[#241C15]">{s.location || 'Duero Public Market'}</p>
                    <p className="text-xs text-[#241C15]/50 line-clamp-2 leading-relaxed">
                      {s.description || 'Standard municipal market stall unit.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t-2 border-dashed border-[#C1440E]/20 flex justify-between items-center text-xs">
                    <span className="text-[#241C15]/50">
                      Size: <strong className="text-[#241C15]">{s.size_sqm} sqm</strong>
                    </span>
                    <span className="text-[#C1440E] font-bold text-sm" style={monoStyle}>
                      {formatCurrency(s.monthly_rate)} / yr
                    </span>
                  </div>

                  <div className="pt-1 flex space-x-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="flex-1 py-2.5 rounded-xl bg-[#241C15]/5 hover:bg-[#0F3D37] hover:text-[#FBF6EA] text-[#241C15] font-bold text-xs border border-[#241C15]/10 hover:border-[#0F3D37] transition flex items-center justify-center space-x-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(s)}
                      className="p-2.5 rounded-xl bg-[#241C15]/5 hover:bg-[#C1440E] hover:text-[#FBF6EA] text-[#241C15]/50 hover:text-[#FBF6EA] border border-[#241C15]/10 transition flex items-center justify-center"
                      title="Delete Space"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { resetForm(); setIsCreateOpen(false); }}
        title="Create Market Space"
      >
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
                min="0"
                placeholder="12.5"
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
                min="0"
                step="0.01"
                placeholder="12000"
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                className={modalInputClass + " font-semibold"}
              />
            </div>
          </div>

          <div>
            <label className={modalLabelClass}>Initial Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={modalInputClass + " font-semibold cursor-pointer"}
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className={modalLabelClass}>Description</label>
            <textarea
              rows="3"
              placeholder="Details about the space, commodities allowed, electrical outlets, etc."
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Market Space'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { resetForm(); setIsEditOpen(false); }}
        title={`Edit Market Space — ${selectedSpace?.space_number}`}
      >
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
              <label className={modalLabelClass}>Space Number *</label>
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
                className={modalInputClass + " font-semibold cursor-pointer"}
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
                min="0"
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
                min="0"
                step="0.01"
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 transition flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedSpace(null); }}
        title="Confirm Space Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C1440E]/12 text-[#C1440E] flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#241C15]">
                Delete Market Space {selectedSpace?.space_number}?
              </h4>
              <p className="text-xs text-[#241C15]/60 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong>{selectedSpace?.space_number}</strong> ({selectedSpace?.location})? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <button
              type="button"
              onClick={() => { setIsDeleteOpen(false); setSelectedSpace(null); }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#241C15]/8 hover:bg-[#241C15]/12 text-[#241C15]/70 font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSpace}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C1440E] hover:bg-[#a8390c] text-[#FBF6EA] font-bold text-sm shadow-lg shadow-[#C1440E]/25 flex items-center justify-center space-x-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Deleting...' : 'Yes, Delete Space'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminSpaces;
