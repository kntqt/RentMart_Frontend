import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();

  // Solid, high-visibility styling (100% opaque, not transparent)
  let styles = 'bg-[#334155] text-white border border-[#1e293b]';
  let dotColor = 'bg-white';

  if (s === 'available' || ['active', 'approved', 'paid'].includes(s)) {
    // Solid Green (available)
    styles = 'bg-[#16a34a] text-white border border-[#15803d] shadow-md';
    dotColor = 'bg-white';
  } else if (s === 'reserved' || ['pending', 'unpaid'].includes(s)) {
    // Solid Yellow (reserved)
    styles = 'bg-[#facc15] text-[#422006] border border-[#eab308] font-black shadow-md';
    dotColor = 'bg-[#422006]';
  } else if (s === 'rented' || ['inactive', 'rejected', 'overdue', 'cancelled'].includes(s)) {
    // Solid Red (rented)
    styles = 'bg-[#dc2626] text-white border border-[#b91c1c] shadow-md';
    dotColor = 'bg-white';
  } else if (s === 'maintenance') {
    // Solid Orange (maintenance)
    styles = 'bg-[#ea580c] text-white border border-[#c2410c] shadow-md';
    dotColor = 'bg-white';
  } else if (['completed'].includes(s)) {
    styles = 'bg-[#16a34a] text-white border border-[#15803d] shadow-md';
    dotColor = 'bg-white';
  } else if (['waived'].includes(s)) {
    styles = 'bg-[#64748b] text-white border border-[#475569] shadow-md';
    dotColor = 'bg-white';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${styles} select-none drop-shadow-sm`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${dotColor}`}></span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;


