import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Search, Eye, Store } from 'lucide-react';

const RenterSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState(null);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse Duero Market Spaces</h1>
          <p className="text-sm text-slate-500 font-medium">Explore all available commercial stalls in Duero Public Market.</p>
        </div>

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
            <option value="rented">Rented</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">{s.space_number}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{s.location}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Size: <strong className="text-slate-700">{s.size_sqm} sqm</strong></span>
                  <span className="text-primary-600 font-extrabold text-sm">{formatCurrency(s.monthly_rate)} / yr</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSpace(s)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-700 hover:text-primary-600 font-bold text-xs border border-slate-200 hover:border-primary-200 transition flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          ))}
        </div>

        <Modal isOpen={!!selectedSpace} onClose={() => setSelectedSpace(null)} title={`Space Detail — ${selectedSpace?.space_number}`}>
          {selectedSpace && (
            <div className="space-y-4">
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
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default RenterSpaces;
