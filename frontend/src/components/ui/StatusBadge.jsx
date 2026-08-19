import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();

  let styles = 'bg-[#241C15]/10 text-[#241C15]/70 border-[#241C15]/20';

  if (['active', 'approved', 'available', 'paid'].includes(s)) {
    styles = 'bg-[#0F3D37]/10 text-[#0F3D37] border-[#0F3D37]/30';
  } else if (['inactive', 'rejected', 'overdue'].includes(s)) {
    styles = 'bg-[#C1440E]/10 text-[#C1440E] border-[#C1440E]/30';
  } else if (['pending', 'unpaid'].includes(s)) {
    styles = 'bg-[#E8A33D]/15 text-[#8a5f1f] border-[#E8A33D]/35';
  } else if (['rented'].includes(s)) {
    styles = 'bg-[#0F3D37]/15 text-[#0F3D37] border-[#0F3D37]/35';
  } else if (['reserved'].includes(s)) {
    styles = 'bg-[#E8A33D]/12 text-[#8a5f1f] border-[#E8A33D]/30';
  } else if (['cancelled'].includes(s)) {
    styles = 'bg-[#C1440E]/12 text-[#C1440E] border-[#C1440E]/25';
  } else if (['completed'].includes(s)) {
    styles = 'bg-[#0F3D37]/10 text-[#0F3D37] border-[#0F3D37]/30';
  } else if (['maintenance', 'waived'].includes(s)) {
    styles = 'bg-[#241C15]/8 text-[#241C15]/60 border-[#241C15]/15';
  }

  const isGreen = styles.includes('#0F3D37');
  const isRed = styles.includes('#C1440E');
  const isAmber = styles.includes('#8a5f1f');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles} capitalize`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        isGreen ? 'bg-[#0F3D37]' :
        isRed ? 'bg-[#C1440E]' :
        isAmber ? 'bg-[#E8A33D]' : 'bg-[#241C15]/40'
      }`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
