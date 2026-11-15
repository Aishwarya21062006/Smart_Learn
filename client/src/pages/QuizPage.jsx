import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import quizService from '../services/quizService.js';
import QuestionCard from '../components/quiz/QuestionCard.jsx';
import QuizResultSummary from '../components/quiz/QuizResultSummary.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const QuizPage = () => {
  const { id: topicId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);

  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setAnswers({});
      setCurrentIndex(0);
      const data = await quizService.getQuiz(topicId);
      setQuizData(data);
    } catch (err) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [topicId]);

  const handleSelectOption = (optionIndex) => {
    const currentQ = quizData?.questions?.[currentIndex];
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const questions = quizData?.questions || [];
    const formattedAnswers = questions.map(q => ({
      questionId: q.id,
      selectedIndex: answers[q.id] != null ? answers[q.id] : null
    }));

    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit your quiz?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const res = await quizService.submitQuiz(topicId, formattedAnswers);
      setResult(res);
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Generating topic quiz..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage title="Quiz error" message={error} onRetry={fetchQuiz} />
      </div>
    );
  }

  // If already submitted, display the result summary
  if (result) {
    return (
      <QuizResultSummary
        result={result}
        topicId={topicId}
        topicTitle={quizData?.topicTitle}
        onRetake={fetchQuiz}
      />
    );
  }

  const questions = quizData?.questions || [];

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <EmptyState
          icon={HelpCircle}
          title="No questions in this quiz yet"
          description="The teacher or administrator has not yet added quiz questions for this topic."
        />
        <div className="text-center">
          <Link to={`/topics/${topicId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Study Notes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Breadcrumb & Quiz Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link
            to={`/topics/${topicId}`}
            className="inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Exit Quiz
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {quizData.topicTitle} Quiz
          </h1>
          <p className="text-xs text-slate-500">
            {quizData.subjectTitle} • Answer each question and click Submit Quiz to evaluate mastery.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-slate-700">
            {answeredCount} of {questions.length} Answered
          </span>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Stepper Indicator */}
      <div className="flex flex-wrap gap-2 justify-center py-1">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] != null;
          const isCurrent = currentIndex === idx;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-2'
                  : isAnswered
                  ? 'bg-teal-100 text-teal-800 border border-teal-200'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <QuestionCard
        question={currentQuestion}
        questionIndex={currentIndex}
        totalQuestions={questions.length}
        selectedOption={answers[currentQuestion?.id]}
        onSelectOption={handleSelectOption}
      />

      {/* Navigation & Submit Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          disabled={currentIndex === 0 || submitting}
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {currentIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              isLoading={submitting}
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
