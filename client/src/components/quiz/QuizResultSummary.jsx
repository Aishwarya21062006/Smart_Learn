import { Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Sparkles, BarChart2, BookOpen } from 'lucide-react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';
import MasteryBadge from '../progress/MasteryBadge.jsx';

export const QuizResultSummary = ({ result, topicId, topicTitle, onRetake }) => {
  const { score = 0, correct = 0, total = 0, mastery = 0, masteryLabel, suggestExplainer = false, review = [] } = result;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getScoreColor = (sc) => {
    if (sc >= 75) return 'text-emerald-600';
    if (sc >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Score Summary Card */}
      <Card className="text-center p-8 bg-white border border-slate-200 shadow-sm">
        <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-700 mb-3">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Quiz Completed!
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {topicTitle ? `Topic: ${topicTitle}` : 'Performance Evaluation'}
        </p>

        {/* Big Score & Details */}
        <div className="my-6">
          <div className={`text-5xl sm:text-6xl font-black tracking-tight ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-sm font-medium text-slate-600 mt-2">
            You answered <span className="font-bold text-slate-900">{correct}</span> out of <span className="font-bold text-slate-900">{total}</span> questions correctly
          </p>
        </div>

        {/* Mastery Badge Update */}
        <div className="inline-flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Current Topic Mastery
          </span>
          <MasteryBadge score={mastery} label={masteryLabel} size="lg" />
        </div>

        {/* Explainer Suggestion Banner if score < 50 */}
        {suggestExplainer && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Need a clearer perspective on this topic?</span>
              </div>
              <p className="text-xs text-purple-700 leading-relaxed">
                Since your score was below 50%, Sensei Hana and Ren have prepared a short visual-novel anime story using everyday analogies to help you master this concept!
              </p>
            </div>
            <Link to={`/explainer/${topicId}`} className="shrink-0">
              <Button variant="primary" size="sm" className="bg-purple-700 hover:bg-purple-800 text-white shadow">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Open Anime Explainer
              </Button>
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" onClick={onRetake}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Retake Quiz
          </Button>
          <Link to={`/topics/${topicId}`}>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-1.5" />
              Back to Study Notes
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="ghost">
              <BarChart2 className="w-4 h-4 mr-1.5" />
              View All Progress
            </Button>
          </Link>
        </div>
      </Card>

      {/* Per-Question Detailed Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Question-by-Question Review</h3>
          <span className="text-xs text-slate-500">{review.length} questions reviewed</span>
        </div>

        <div className="space-y-4">
          {review.map((item, idx) => {
            const isCorrect = item.correct;

            return (
              <Card
                key={item.questionId || idx}
                className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900 mb-4">
                  {item.question}
                </p>

                {/* Options Review */}
                <div className="space-y-2 mb-4">
                  {(item.options || []).map((optText, oIdx) => {
                    const isUserChoice = item.selectedIndex === oIdx;
                    const isRightAnswer = item.correctIndex === oIdx;
                    const letter = optionLetters[oIdx] || `${oIdx + 1}`;

                    let optionBg = 'bg-white border-slate-200 text-slate-700';
                    if (isRightAnswer) {
                      optionBg = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                    } else if (isUserChoice && !isCorrect) {
                      optionBg = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-3 ${optionBg}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-600">
                            {letter}
                          </span>
                          <span>{optText}</span>
                        </div>

                        {isRightAnswer && (
                          <span className="text-[11px] font-bold text-emerald-700 uppercase">
                            Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isCorrect && (
                          <span className="text-[11px] font-bold text-rose-700 uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Teacher's Explanation */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">
                      Explanation:
                    </span>
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultSummary;
