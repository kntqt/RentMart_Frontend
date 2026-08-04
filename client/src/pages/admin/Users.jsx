import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import FlashMessage from '../../components/ui/FlashMessage';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, Search, Eye, EyeOff, Check, X, Edit, Trash2, UserPlus, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });

  // Password visibility state map
  const [showPassMap, setShowPassMap] = useState({});

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    role: 'renter',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    contact_number: '',
    address: '',
    gender: 'Male',
    civil_status: 'Single',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?role=${roleFilter}&search=${search}`);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAutoFill = () => {
    if (!formData.first_name || !formData.last_name) return;
    const autoEmail = `${formData.first_name.toLowerCase().trim()}${formData.last_name.toLowerCase().trim()}@duero.com`;
    const autoPassword = `${formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1)}1234`;
    setFormData(prev => ({ ...prev, email: autoEmail, password: autoPassword }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setFlash({ type: 'success', message: 'User account created successfully.' });
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error creating user.' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser.id}`, formData);
      setFlash({ type: 'success', message: 'User details updated successfully.' });
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: error.response?.data?.message || 'Error updating user.' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/users/${id}/status`, { status });
      setFlash({ type: 'success', message: `User status changed to ${status}.` });
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: 'Error updating user status.' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/users/${id}/approve`);
      setFlash({ type: 'success', message: 'Renter approved and activated.' });
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: 'Error approving renter.' });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/users/${id}/reject`);
      setFlash({ type: 'success', message: 'Renter registration rejected.' });
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: 'Error rejecting renter.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await api.delete(`/users/${id}`);
      setFlash({ type: 'success', message: 'User deleted.' });
      fetchUsers();
    } catch (error) {
      setFlash({ type: 'error', message: 'Error deleting user.' });
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      role: u.role,
      first_name: u.first_name,
      middle_name: u.middle_name || '',
      last_name: u.last_name,
      email: u.email,
      password: '',
      contact_number: u.contact_number || '',
      address: u.address || '',
      gender: u.gender || 'Male',
      civil_status: u.civil_status || 'Single',
      status: u.status
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      role: 'renter',
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      password: '',
      contact_number: '',
      address: '',
      gender: 'Male',
      civil_status: 'Single',
      status: 'active'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Users Management</h1>
            <p className="text-sm text-slate-500 font-medium">Manage Admin, Staff, and Renter accounts.</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25 flex items-center justify-center space-x-2 transition"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New User</span>
          </button>
        </div>

        <FlashMessage type={flash.type} message={flash.message} onClose={() => setFlash({ type: '', message: '' })} />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All User Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="renter">Renter</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User Details</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Stored Password</th>
                  <th className="py-4 px-6">Approval</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                            {u.first_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.first_name} {u.middle_name} {u.last_name}</p>
                            <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          u.role === 'staff' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Password Plain Visibility Toggle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-slate-600">
                            {showPassMap[u.id] ? (u.password_plain || 'Encrypted') : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                          >
                            {showPassMap[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                      {/* Approval Status & Actions */}
                      <td className="py-4 px-6">
                        {u.approval_status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(u.id)}
                              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 flex items-center space-x-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <StatusBadge status={u.approval_status} />
                        )}
                      </td>

                      {/* Active/Inactive Toggle */}
                      <td className="py-4 px-6">
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.id, e.target.value)}
                          className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User Account">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                onBlur={handleAutoFill}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                onBlur={handleAutoFill}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none"
              >
                <option value="staff">Staff</option>
                <option value="renter">Renter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact #</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <button type="button" onClick={handleAutoFill} className="text-[11px] font-bold text-primary-600 hover:underline flex items-center">
                <RefreshCw className="w-3 h-3 mr-1" /> Auto-Generate Pattern
              </button>
            </div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
              Create User Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User Account">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reset Password (leave blank to keep current)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
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

export default AdminUsers;
