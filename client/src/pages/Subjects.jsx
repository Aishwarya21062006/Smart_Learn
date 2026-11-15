import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import learningService from '../services/learningService.js';
import SubjectCard from '../components/learning/SubjectCard.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  if (loading) {
    return <Loader message="Loading learning subjects..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage
          title="Could not load subjects"
          message={error}
          onRetry={fetchSubjects}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Learning Subjects
            </h1>
            <p className="text-sm text-slate-500">
              Select a subject to begin studying topics, take quizzes, and track your mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects available"
          description="Subjects haven't been added by the administrator yet. Please check back later."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
