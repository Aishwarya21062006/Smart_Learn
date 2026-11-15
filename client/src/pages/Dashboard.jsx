import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Sparkles, Brain, Award, Clock, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import RecommendationCard from '../components/learning/RecommendationCard.jsx';
import recommendationService from '../services/recommendationService.js';
import progressService from '../services/progressService.js';
import learningService from '../services/learningService.js';

export const Dashboard = () => {
  const { profile, user, isAdmin } = useAuth();
  const displayName = profile?.name || user?.email?.split('@')[0] || 'Student';

  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(null);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [recs, prog, subs] = await Promise.allSettled([
        recommendationService.getRecommendations(4),
        progressService.getProgress(),
        learningService.getSubjects()
      ]);

      if (recs.status === 'fulfilled') setRecommendations(recs.value);
      if (prog.status === 'fulfilled') setProgress(prog.value);
      if (subs.status === 'fulfilled') setSubjectsCount(subs.value?.length || 0);
    } catch (err) {
      console.warn('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const avgMastery = progress?.averageMastery != null ? `${progress.averageMastery}%` : '-- %';
  const weakTopics = progress?.weakTopics || [];
  const strongTopics = progress?.strongTopics || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/30 text-teal-200 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Adaptive Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
            SmartLearn dynamically analyzes your quiz performance to build an optimal study path, detect weak concepts, and accelerate your exam readiness.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/subjects">
              <Button variant="white" size="md" className="font-bold shadow">
                <BookOpen className="w-4 h-4 mr-1.5 text-teal-800" />
                Browse Subjects
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant="outline-light" size="md" className="font-semibold">
                <TrendingUp className="w-4 h-4 mr-1.5 text-teal-200" />
                My Progress
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="none" size="md" className="border border-amber-400/80 text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 focus:ring-amber-400 shadow-sm font-semibold">
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-teal-600/20 pointer-events-none blur-2xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Subjects</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{subjectsCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Enrolled courses</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Mastery</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{avgMastery}</p>
            <p className="text-xs text-slate-400 mt-0.5">Exponential moving score</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Topics Attempted</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{progress?.totalAttemptedTopics || 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">Quizzed topics</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily AI Limit</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">20</p>
            <p className="text-xs text-slate-400 mt-0.5">Tutor quota per day</p>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Adaptive Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">Recommended Next Steps</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
                  title="Refresh Recommendations"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  Adaptive Engine
                </span>
              </div>
            </div>

            {loading ? (
              <div className="py-8">
                <Loader message="Calculating personalized recommendations..." />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 text-center">
                <p className="font-medium text-slate-800">No recommendations available yet.</p>
                <p className="text-xs text-slate-500 mt-1">Start by browsing curriculum topics and taking quick self-assessment quizzes!</p>
                <div className="mt-4">
                  <Link to="/subjects">
                    <Button variant="primary" size="sm">Browse Subjects</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.topicId} recommendation={rec} />
                ))}
              </div>
            )}
          </Card>

          {/* Recent Quiz Attempts Widget */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Quiz Activity</h3>
              <Link to="/progress" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View all history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!progress?.recentAttempts || progress.recentAttempts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <p className="text-sm font-medium text-slate-700">No quizzes taken yet</p>
                <p className="text-xs text-slate-500 mt-1">Take your first 5-minute quiz to see instant score breakdowns and mastery curves.</p>
                <div className="mt-4">
                  <Link to="/subjects">
                    <Button variant="outline" size="sm">Start a Quiz</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {progress.recentAttempts.slice(0, 4).map((att) => {
                  const scoreVal = Number(att.score) || 0;
                  const displayScore = scoreVal <= 1 && scoreVal > 0 ? Math.round(scoreVal * 100) : Math.round(scoreVal);

                  return (
                    <div key={att.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{att.topicTitle}</p>
                        <p className="text-xs text-slate-500">{att.subjectTitle} • {new Date(att.takenAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                          displayScore >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : displayScore >= 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {displayScore}% ({att.correctAnswers}/{att.totalQuestions})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Weak & Strong Topics Tracker */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900">Topic Mastery</h3>
              <Link to="/progress" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Full Report →
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time radar of strong concepts and topics needing revision.
            </p>

            <div className="space-y-4">
              {/* Weak Topics */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Focus Areas ({weakTopics.length})
                </div>
                {weakTopics.length === 0 ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Great job! No weak topics detected. Maintain your scores by practicing regularly.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {weakTopics.slice(0, 3).map((w) => (
                      <li key={w.topicId} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-rose-100">
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">{w.topicTitle}</span>
                        <Link to={`/topics/${w.topicId}/quiz`} className="text-rose-600 font-bold hover:underline shrink-0">
                          Revise ({w.masteryScore}%)
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Strong Topics */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mastered Concepts ({strongTopics.length})
                </div>
                {strongTopics.length === 0 ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Score 75% or higher on topic quizzes to unlock mastery badges.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {strongTopics.slice(0, 3).map((s) => (
                      <li key={s.topicId} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">{s.topicTitle}</span>
                        <span className="font-bold text-emerald-700">{s.masteryScore}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
