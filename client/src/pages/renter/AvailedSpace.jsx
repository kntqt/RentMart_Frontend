import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import { Building2, Store, Calendar, ShieldCheck } from 'lucide-react';

const RenterAvailedSpace = () => {
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    api.get('/dashboard/renter').then(res => setSpaces(res.data.assignedSpaces || [])).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Availed Market Spaces</h1>
          <p className="text-sm text-slate-500 font-medium">Detailed information on your actively leased commercial units at Duero Public Market.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {spaces.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <Store className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No Active Availed Spaces</h3>
              <p className="text-xs text-slate-400">Contact municipal market staff to request a space assignment.</p>
            </div>
          ) : (
            spaces.map((s, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{s.space_number}</h3>
                    <p className="text-sm font-bold text-slate-600 mt-0.5">{s.location}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Stall Size</p>
                    <p className="text-lg font-extrabold text-slate-900">{s.size_sqm} sqm</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Yearly Rate</p>
                    <p className="text-lg font-extrabold text-primary-600">{formatCurrency(s.monthly_rate)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium pt-2">
                  <div className="flex justify-between">
                    <span>Lease Commenced:</span>
                    <strong className="text-slate-900">{formatDate(s.start_date)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lease Expiry:</span>
                    <strong className="text-slate-900">{formatDate(s.end_date)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RenterAvailedSpace;
