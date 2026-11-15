import { Link } from 'react-router-dom';
import { AlertCircle, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import Button from '../common/Button.jsx';

export const WeakTopicList = ({ weakTopics = [] }) => {
  if (!weakTopics || weakTopics.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-100">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-emerald-900">Great Job!</h4>
        <p className="text-xs text-emerald-700 mt-1">
          You currently have no weak topics. Keep practicing quizzes to maintain high mastery!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakTopics.map((topic) => (
        <div
          key={topic.id}
          className="p-4 bg-white border border-rose-200 rounded-xl hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                  Needs Revision
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {topic.masteryScore}% Mastery
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {topic.title}
              </h4>
              <p className="text-xs text-slate-500">
                {topic.subjectTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link to={`/explainer/${topic.id}`}>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Explainer
              </Button>
            </Link>
            <Link to={`/topics/${topic.id}`}>
              <Button variant="primary" size="sm" className="text-xs">
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Study
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeakTopicList;
