export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'BOOKED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'IN_QUEUE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'IN_PROGRESS':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};
