import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, CreditCard, Receipt, Store } from 'lucide-react';

const AdminTransactions = () => {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Transactions Log</h1>
          <p className="text-sm text-slate-500 font-medium">Audit trail of all recorded market rental payments and official receipts.</p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by renter name, space #, or reference number..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Reference #</th>
                  <th className="py-4 px-6">Renter Name</th>
                  <th className="py-4 px-6">Stall Space</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Balance After</th>
                  <th className="py-4 px-6">Payment Type</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">No transaction records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                        {p.reference_number || `REC-${p.id}`}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                          <Store className="w-3.5 h-3.5 mr-1" />
                          {p.space_number || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-600">
                        {formatCurrency(p.amount_paid)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        {formatCurrency(p.balance_after)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold capitalize">
                          {p.payment_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
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
