import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} SmartLearn — AI-Powered Personalized Learning Platform. College Mini Project.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
