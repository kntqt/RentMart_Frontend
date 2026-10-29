import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency, formatDate, getSpaceImageUrl } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
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

const RenterAvailedSpace = () => {
  useMarketFonts();
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    api.get('/dashboard/renter').then(res => setSpaces(res.data.assignedSpaces || [])).catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <div>
          <h1 className="text-2xl text-[#241C15] tracking-tight" style={displayStyle}>My Availed Market Spaces</h1>
          <p className="text-sm text-[#241C15]/50 font-medium">Detailed information on your actively leased commercial units at Duero Public Market.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {spaces.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center bg-white rounded-2xl border border-[#241C15]/8 space-y-3">
              <Store className="w-12 h-12 text-[#241C15]/20 mx-auto" />
              <h3 className="text-lg font-bold text-[#241C15]/70">No Active Availed Spaces</h3>
              <p className="text-xs text-[#241C15]/40">Contact municipal market staff to request a space assignment.</p>
            </div>
          ) : (
            spaces.map((s, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl bg-white border border-[#241C15]/8 shadow-sm space-y-0">
                <div className="relative h-48 w-full bg-[#F6EFDE]">
                  <img src={getSpaceImageUrl(s.image, s.space_number)} alt={s.space_number} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4"><StatusBadge status={s.status} /></div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl text-[#241C15]" style={displayStyle}>{s.space_number}</h3>
                    <p className="text-sm font-bold text-[#241C15]/60 mt-0.5">{s.location}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-[#F6EFDE] p-4 rounded-xl border-2 border-dashed border-[#C1440E]/20">
                    <div>
                      <p className="text-xs text-[#241C15]/40 uppercase font-bold">Stall Size</p>
                      <p className="text-lg font-bold text-[#241C15]">{s.size_sqm} sqm</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#241C15]/40 uppercase font-bold">Yearly Rate</p>
                      <p className="text-lg font-bold text-[#C1440E]" style={monoStyle}>{formatCurrency(s.monthly_rate)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[#241C15]/60 font-medium pt-2 border-t border-[#241C15]/8">
                    <div className="flex justify-between">
                      <span>Lease Commenced:</span>
                      <strong className="text-[#241C15]">{formatDate(s.start_date)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Lease Expiry:</span>
                      <strong className="text-[#241C15]">{formatDate(s.end_date)}</strong>
                    </div>
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
