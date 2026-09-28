import React from 'react';
import { getStatusBadgeColor } from '../utils/formatters';

const StatusBadge = ({ status }) => {
  const colorClass = getStatusBadgeColor(status);
  const formattedText = status ? status.replace('_', ' ') : 'UNKNOWN';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {formattedText}
    </span>
  );
};

export default StatusBadge;
