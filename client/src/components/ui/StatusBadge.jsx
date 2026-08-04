import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'approved', 'available', 'paid'].includes(s)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  } else if (['inactive', 'rejected', 'overdue'].includes(s)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/60';
  } else if (['pending', 'unpaid'].includes(s)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/60';
  } else if (['rented'].includes(s)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/60';
  } else if (['maintenance', 'waived'].includes(s)) {
    styles = 'bg-slate-100 text-slate-600 border-slate-300/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        styles.includes('emerald') ? 'bg-emerald-500' :
        styles.includes('rose') ? 'bg-rose-500' :
        styles.includes('amber') ? 'bg-amber-500' :
        styles.includes('blue') ? 'bg-blue-500' : 'bg-slate-400'
      }`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
