import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Layers, HelpCircle, Users, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import useAuth from '../../hooks/useAuth.js';
import adminService from '../../services/adminService.js';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    subjectsCount: 0,
    topicsCount: 0,
    questionsCount: 0,
    usersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
            <p className="text-sm text-slate-500">
              Logged in as {profile?.name || 'Administrator'} ({profile?.role})
            </p>
          </div>
        </div>
      </div>

      {/* Admin Counts & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Subjects</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : stats.subjectsCount}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Topics</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : stats.topicsCount}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Questions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : stats.questionsCount}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Registered Users</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '...' : stats.usersCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Management Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Manage Subjects</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Create subject titles, update curriculum descriptions, and organize educational domains.
            </p>
          </div>
          <Link to="/admin/subjects">
            <Button variant="primary" size="sm" className="w-full">
              Manage Subjects
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Manage Topics</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Write notes, set difficulty levels, upload PDF materials, and trigger vector indexing.
            </p>
          </div>
          <Link to="/admin/topics">
            <Button variant="primary" size="sm" className="w-full">
              Manage Topics
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Question Bank</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Create multiple-choice quiz questions, define answer keys, and write detailed explanations.
            </p>
          </div>
          <Link to="/admin/questions">
            <Button variant="primary" size="sm" className="w-full">
              Manage Questions
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
