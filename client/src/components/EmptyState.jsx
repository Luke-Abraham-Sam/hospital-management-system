import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ title = 'No records found', message = 'There are no items to display at this time.', actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center my-4 shadow-sm">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
        <FolderOpen size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
