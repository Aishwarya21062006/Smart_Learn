import { BookOpen, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';

export const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return null;

  const {
    topicId,
    topicTitle,
    subjectTitle,
    difficulty,
    masteryScore,
    reason,
    tier
  } = recommendation;

  // Tier configuration
  const getTierBadge = () => {
    switch (tier) {
      case 'weak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Needs Revision
          </span>
        );
      case 'next_in_subject':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRight className="w-3 h-3 text-blue-500" />
            Next in Sequence
          </span>
        );
      case 'reinforce':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Award className="w-3 h-3 text-amber-500" />
            Reinforce Mastery ({masteryScore}%)
          </span>
        );
      case 'unstarted':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Recommended Next
          </span>
        );
    }
  };

  const getDifficultyBadge = () => {
    const diff = difficulty || 1;
    if (diff === 1) return <span className="text-xs text-emerald-600 font-medium">Beginner</span>;
    if (diff === 2) return <span className="text-xs text-amber-600 font-medium">Intermediate</span>;
    return <span className="text-xs text-purple-600 font-medium">Advanced</span>;
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {getTierBadge()}
          <span className="text-xs text-slate-400 font-medium">{getDifficultyBadge()}</span>
        </div>

        <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
          {topicTitle}
        </h4>
        <p className="text-xs font-medium text-teal-600 mb-2">
          {subjectTitle}
        </p>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          {reason}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Link to={`/topics/${topicId}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs justify-center">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Study Notes
          </Button>
        </Link>
        <Link to={`/topics/${topicId}/quiz`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full text-xs justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Take Quiz
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;
