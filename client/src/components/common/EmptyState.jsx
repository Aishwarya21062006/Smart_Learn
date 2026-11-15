import { FolderOpen } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl border border-dashed border-slate-300 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
