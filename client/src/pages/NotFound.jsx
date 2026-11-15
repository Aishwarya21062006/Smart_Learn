import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="mt-2 text-lg font-medium text-slate-700">Page Not Found</p>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
