import Card from '../common/Card.jsx';

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption
}) => {
  if (!question) return null;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Card className="space-y-6">
      {/* Header & Step Counter */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="text-xs text-slate-400">
          Select one option
        </span>
      </div>

      {/* Question Text */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {question.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {(question.options || []).map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          const letter = optionLetters[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-sm ring-1 ring-teal-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {/* Option Letter Indicator */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm pt-0.5 leading-relaxed">
                {optionText}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuestionCard;
