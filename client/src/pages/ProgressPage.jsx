import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, CheckCircle, AlertCircle, Award, Clock, ArrowRight, BookOpen } from 'lucide-react';
import progressService from '../services/progressService.js';
import ProgressChart from '../components/progress/ProgressChart.jsx';
import WeakTopicList from '../components/progress/WeakTopicList.jsx';
import MasteryBadge from '../components/progress/MasteryBadge.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getProgress();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load progress analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <Loader message="Compiling your learning progress & analytics..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage
          title="Progress tracking unavailable"
          message={error || 'Could not fetch your progress statistics.'}
          onRetry={fetchProgress}
        />
      </div>
    );
  }

  const {
    completionBySubject = [],
    topics = [],
    weakTopics = [],
    strongTopics = [],
    averageMastery = 0,
    totalAttemptedTopics = 0,
    recentAttempts = []
  } = data;

  const totalTopics = topics.length;
  const completedTopicsCount = topics.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Learning Analytics
            </h1>
            <p className="text-sm text-slate-500">
              Track your mastery evolution, test performance, and revision targets
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Mastery</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{averageMastery}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across {totalAttemptedTopics} evaluated topics</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Topics</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{completedTopicsCount} / {totalTopics}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Score ≥ 60% on quiz</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Strong Topics</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{strongTopics.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Mastery ≥ 75%</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Needs Revision</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{weakTopics.length}</p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Mastery &lt; 50%</p>
          </div>
        </Card>
      </div>

      {/* Main Split: Performance Chart & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Score Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Quiz Performance</h3>
                <p className="text-xs text-slate-500">Scores from your latest quiz attempts</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                Last {recentAttempts.length} quizzes
              </span>
            </div>

            <ProgressChart data={recentAttempts} height={260} />
          </Card>

          {/* Subject Completion Progress Bars */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 mb-4">Subject Track Completion</h3>
            <div className="space-y-4">
              {completionBySubject.map((s) => (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{s.title}</span>
                    <span className="text-slate-500">{s.completedTopics} of {s.totalTopics} completed ({s.completionPercentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${s.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Weak Topics List */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Priority Revision List</h3>
              <span className="text-xs text-rose-600 font-semibold">{weakTopics.length} flagged</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              The AI highlights topics where you scored under 50% so you can review notes or launch the visual explainer.
            </p>
            <WeakTopicList weakTopics={weakTopics} />
          </Card>
        </div>
      </div>

      {/* Topic-by-Topic Mastery Curriculum Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curriculum Mastery Breakdown</h3>
            <p className="text-xs text-slate-500">Every topic in your syllabus with live mastery tracking</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3">Topic</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Mastery</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topics.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">
                    {t.title}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {t.subjectTitle}
                  </td>
                  <td className="px-6 py-3.5 capitalize">
                    {t.status === 'completed' ? (
                      <span className="text-emerald-700 font-semibold">Completed</span>
                    ) : t.status === 'in_progress' ? (
                      <span className="text-blue-600 font-semibold">In Progress</span>
                    ) : (
                      <span className="text-slate-400">Not Started</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <MasteryBadge score={t.masteryScore} label={t.masteryLabel} size="sm" />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/topics/${t.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Study
                        </Button>
                      </Link>
                      <Link to={`/topics/${t.id}/quiz`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Quiz
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attempt History Table */}
      {recentAttempts.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Attempt Log</h3>
              <p className="text-xs text-slate-500">Last 10 quizzes submitted</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Topic</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Correct Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                      {new Date(att.takenAt).toLocaleDateString()} {new Date(att.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-900">
                      {att.topicTitle}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`font-bold ${att.score >= 75 ? 'text-emerald-600' : att.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {att.score}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {att.correctAnswers} / {att.totalQuestions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;
