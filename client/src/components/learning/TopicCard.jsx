import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

export const TopicCard = ({ topic }) => {
  const { id, title, difficulty = 1, position = 0, status = 'not_started', mastery_score = 0 } = topic;

  const difficultyConfig = {
    1: { label: 'Easy', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    2: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    3: { label: 'Hard', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: PlayCircle },
    completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle }
  };

  const diff = difficultyConfig[difficulty] || difficultyConfig[1];
  const stat = statusConfig[status] || statusConfig.not_started;
  const StatusIcon = stat.icon;

  const getMasteryColor = (score) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score > 0) return 'text-rose-700 bg-rose-50 border-rose-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  return (
    <Card hoverable className="flex flex-col justify-between transition-all hover:border-slate-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            Topic {position + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${diff.color}`}>
              {diff.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${stat.color}`}>
              <StatusIcon className="w-3 h-3" />
              {stat.label}
            </span>
          </div>
        </div>

        <h4 className="text-base font-bold text-slate-900 line-clamp-2 mb-2">
          {title}
        </h4>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mastery</p>
          <div className={`mt-0.5 inline-block text-xs font-bold px-2 py-0.5 rounded border ${getMasteryColor(mastery_score)}`}>
            {mastery_score > 0 ? `${mastery_score}%` : 'Unrated'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/topics/${id}`}>
            <Button variant="primary" size="sm">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Study
            </Button>
          </Link>
          <Link to={`/topics/${id}/quiz`}>
            <Button variant="outline" size="sm">
              Quiz
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default TopicCard;
