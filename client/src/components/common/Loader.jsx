import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
