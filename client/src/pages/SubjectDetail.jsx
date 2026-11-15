import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import learningService from '../services/learningService.js';
import TopicCard from '../components/learning/TopicCard.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const SubjectDetail = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningService.getSubject(id);
      setSubject(data);
    } catch (err) {
      setError(err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
  }, [id]);

  if (loading) {
    return <Loader message="Loading subject details and topics..." />;
  }

  if (error || !subject) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage
          title="Subject not found"
          message={error || 'Unable to retrieve the requested subject.'}
          onRetry={fetchSubject}
        />
      </div>
    );
  }

  const { title, description, topics = [] } = subject;
  const completedCount = topics.filter(t => t.status === 'completed').length;
  const inProgressCount = topics.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-8">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/subjects"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all subjects
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {description || 'Explore the topics in this subject sequentially.'}
            </p>

            {/* Quick stats pills */}
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                <Layers className="w-3.5 h-3.5" />
                {topics.length} Total Topics
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {inProgressCount} In Progress
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                {completedCount} Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Topic Curriculum</h2>
          <span className="text-xs text-slate-500">Ordered by study sequence</span>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            title="No topics in this subject"
            description="Topics have not yet been assigned to this subject by the administrator."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
