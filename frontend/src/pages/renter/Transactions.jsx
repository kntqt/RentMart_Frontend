import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Store } from 'lucide-react';

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

const RenterTransactions = () => {
  useMarketFonts();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payments/renter').then(res => setPayments(res.data || [])).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>My Payment History</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Personal transaction history and digital payment receipts.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#241C15]/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6EFDE] border-b border-[#241C15]/8 text-xs font-bold text-[#241C15]/40 uppercase tracking-wider">
                  <th className="py-4 px-6">Official Receipt #</th>
                  <th className="py-4 px-6">Stall Space</th>
                  <th className="py-4 px-6">Amount Paid</th>
                  <th className="py-4 px-6">Balance Remaining</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#241C15]/8 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#241C15]/40 font-medium">No personal payment records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F6EFDE]/60 transition">
                      <td className="py-4 px-6 text-xs font-bold text-[#241C15]/70" style={monoStyle}>
                        {p.reference_number || `OR-${p.id}`}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#0F3D37]/8 text-[#0F3D37] font-bold text-xs border border-[#0F3D37]/20">
                          <Store className="w-3.5 h-3.5 mr-1" />
                          {p.space_number}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#0F3D37]" style={monoStyle}>
                        {formatCurrency(p.amount_paid)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#241C15]/60" style={monoStyle}>
                        {formatCurrency(p.balance_after)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-[#F6EFDE] text-[#241C15]/70 text-xs font-bold border border-[#241C15]/10">
                          {p.payment_method}
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

export default RenterTransactions;
