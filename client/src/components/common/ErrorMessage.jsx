import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button.jsx';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="bg-white text-red-700 border-red-300 hover:bg-red-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
