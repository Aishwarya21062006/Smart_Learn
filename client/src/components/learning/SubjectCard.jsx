import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card.jsx';

export const SubjectCard = ({ subject }) => {
  const { id, title, description, totalTopics = 0, completedTopics = 0, completionPercentage = 0 } = subject;

  return (
    <Link to={`/subjects/${id}`} className="block group">
      <Card hoverable className="h-full flex flex-col justify-between transition-all group-hover:border-teal-400 group-hover:shadow-md">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            {completionPercentage === 100 && totalTopics > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
            {description || 'No description provided for this subject.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium">{completedTopics} of {totalTopics} topics</span>
            <span className="font-semibold text-slate-700">{completionPercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-teal-600 group-hover:text-teal-700">
            <span>Explore Topics</span>
            <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default SubjectCard;
