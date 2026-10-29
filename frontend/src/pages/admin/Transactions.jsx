import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, Store } from 'lucide-react';

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

const AdminTransactions = () => {
  useMarketFonts();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [search]);

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments?search=${search}`);
      setPayments(res.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>System Transactions Log</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Audit trail of all recorded market rental payments and official receipts.</p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#241C15]/8 shadow-sm">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-[#241C15]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by renter name, space #, or reference number..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#F6EFDE] border border-[#241C15]/10 text-sm text-[#241C15] focus:outline-none focus:border-[#C1440E]"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                  <th className="py-4 px-6">Reference #</th>
                  <th className="py-4 px-6">Renter Name</th>
                  <th className="py-4 px-6">Stall Space</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Balance After</th>
                  <th className="py-4 px-6">Payment Type</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-[#241C15]/40 font-medium">No transaction records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F6EFDE]/60 transition">
                      <td className="py-4 px-6 text-xs font-bold text-[#241C15]/70" style={monoStyle}>
                        {p.reference_number || `REC-${p.id}`}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#241C15]">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#0F3D37]/8 text-[#0F3D37] font-bold text-xs border border-[#0F3D37]/20">
                          <Store className="w-3.5 h-3.5 mr-1" />
                          {p.space_number || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0F3D37]" style={monoStyle}>
                        {formatCurrency(p.amount_paid)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#241C15]/60" style={monoStyle}>
                        {formatCurrency(p.balance_after)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-[#E8A33D]/12 text-[#8a5f1f] border border-[#E8A33D]/35 text-xs font-bold capitalize">
                          {p.payment_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#241C15]/50 font-medium">
                        {formatDate(p.payment_date)}
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

export default AdminTransactions;
