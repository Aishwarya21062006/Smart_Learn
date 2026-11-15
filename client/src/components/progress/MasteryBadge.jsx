import { Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MasteryBadge = ({ score = 0, label = null, showIcon = true, size = 'md' }) => {
  const numericScore = Number(score) || 0;

  // Determine label if not explicitly provided
  let badgeLabel = label;
  if (!badgeLabel) {
    if (numericScore >= 75) badgeLabel = 'strong';
    else if (numericScore >= 50) badgeLabel = 'average';
    else if (numericScore > 0) badgeLabel = 'weak';
    else badgeLabel = 'unrated';
  }

  const configs = {
    strong: {
      text: 'Strong Mastery',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: Award
    },
    average: {
      text: 'Average Mastery',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: CheckCircle2
    },
    weak: {
      text: 'Needs Revision',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertTriangle
    },
    unrated: {
      text: 'Not Assessed',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: CheckCircle2
    }
  };

  const current = configs[badgeLabel] || configs.unrated;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.color} ${
        sizeClasses[size] || sizeClasses.md
      }`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{current.text}</span>
      {numericScore > 0 && <span className="font-bold">({numericScore}%)</span>}
    </span>
  );
};

export default MasteryBadge;
