import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const FlashMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const bgMap = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  const IconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const Icon = IconMap[type] || Info;

  return (
    <div className={`flex items-center justify-between p-4 mb-6 rounded-2xl border ${bgMap[type] || bgMap.info} animate-in slide-in-from-top-2 duration-300 shadow-sm`}>
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default FlashMessage;
