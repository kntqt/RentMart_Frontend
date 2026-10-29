import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241C15]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-[#241C15]/10 overflow-hidden transform animate-in zoom-in-95 duration-200`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#241C15]/8 bg-[#F6EFDE]">
          <h3 className="text-xl font-bold text-[#241C15]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-[#241C15]/50 hover:text-[#241C15] rounded-xl hover:bg-[#241C15]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
