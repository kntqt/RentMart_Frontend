import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Search, Eye, EyeOff, Store, Phone, Mail, MapPin } from 'lucide-react';

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

  useEffect(() => {
    fetchRenters();
  }, [search]);

  const fetchRenters = async () => {
    try {
      const res = await api.get(`/users/renters?search=${search}`);
      setRenters(res.data);
    } catch (error) {
      console.error('Error fetching renters:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (id) => {
    setShowPassMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>Market Renters Directory</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Read-only view of all registered market vendors and assigned spaces.</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search renter by name, email, or assigned space..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E]"
            />
          </div>
        </div>

        {/* Renters Table */}
        <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                  <th className="py-4 px-6">Renter Details</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Assigned Space</th>
                  <th className="py-4 px-6">Password History</th>
                  <th className="py-4 px-6">Approval Status</th>
                  <th className="py-4 px-6">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {renters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#241C15]/40 font-medium">No registered renters found.</td>
                  </tr>
                ) : (
                  renters.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F6EFDE]/60 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0F3D37]/10 text-[#0F3D37] flex items-center justify-center font-bold">
                            {r.first_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#241C15]">{r.first_name} {r.middle_name} {r.last_name}</p>
                            <p className="text-xs text-[#241C15]/50 font-medium">ID #{String(r.id).padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-[#241C15]/70 flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-[#241C15]/35" />
                            {r.email}
                          </p>
                          <p className="text-xs text-[#241C15]/50 flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-[#241C15]/35" />
                            {r.contact_number || 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {r.space_number ? (
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-xl bg-[#0F3D37]/8 text-[#0F3D37]">
                              <Store className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-[#241C15]">{r.space_number}</p>
                              <p className="text-xs text-[#241C15]/50">{r.location}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#241C15]/35 italic">No assigned space</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#241C15]/70" style={monoStyle}>
                            {showPassMap[r.id] ? (r.password_plain || 'Encrypted') : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePassword(r.id)}
                            className="p-1 text-[#241C15]/35 hover:text-[#241C15]/70 rounded transition"
                          >
                            {showPassMap[r.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={r.approval_status} />
                      </td>

                      <td className="py-4 px-6 text-xs text-[#241C15]/50 font-medium">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRenters;
