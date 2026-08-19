import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, Receipt, Store } from 'lucide-react';

const RenterTransactions = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payments/renter').then(res => setPayments(res.data || [])).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Payment History</h1>
          <p className="text-sm text-slate-500 font-medium">Personal transaction history and digital payment receipts.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Official Receipt #</th>
                  <th className="py-4 px-6">Stall Space</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Balance Remaining</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">No personal payment records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">
                        {p.reference_number || `OR-${p.id}`}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {p.space_number}
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-600">
                        {formatCurrency(p.amount_paid)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">
                        {formatCurrency(p.balance_after)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {p.payment_method}
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

export default RenterTransactions;
