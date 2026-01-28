
import React from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'slate' | 'orange' | 'emerald';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };

  const iconClasses = {
    blue: 'bg-blue-600',
    slate: 'bg-slate-600',
    orange: 'bg-orange-600',
    emerald: 'bg-emerald-600'
  };

  return (
    <div className={`p-5 rounded-xl border ${colorClasses[color]} bg-white shadow-sm flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconClasses[color]} flex items-center justify-center`}>
          <i className={`fas ${icon} text-white text-xs`}></i>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800">
        {value}
      </div>
    </div>
  );
};

export default SummaryCard;
