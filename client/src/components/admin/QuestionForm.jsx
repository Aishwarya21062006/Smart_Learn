import { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

export const QuestionForm = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  topicTitle = ''
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || '');
      setOptions(initialData.options && initialData.options.length >= 2 ? initialData.options : ['', '', '', '']);
      setCorrectIndex(initialData.correct_index != null ? Number(initialData.correct_index) : 0);
      setExplanation(initialData.explanation || '');
    } else {
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setExplanation('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (idx) => {
    if (options.length <= 2) {
      setError('A question must have at least 2 options.');
      return;
    }
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctIndex >= updated.length) {
      setCorrectIndex(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('Question text is required.');
      return;
    }

    const trimmedOptions = options.map(o => o.trim());
    if (trimmedOptions.some(o => !o)) {
      setError('All option fields must be filled in.');
      return;
    }

    if (correctIndex < 0 || correctIndex >= trimmedOptions.length) {
      setError('Please select a valid correct answer option.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        question: question.trim(),
        options: trimmedOptions,
        correct_index: Number(correctIndex),
        explanation: explanation.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Quiz Question' : 'Add Quiz Question'}
            </h3>
            {topicTitle && (
              <p className="text-xs text-slate-500">For topic: {topicTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && <ErrorMessage message={error} />}

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Question Text *
            </label>
            <textarea
              rows={3}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the time complexity of searching in a balanced Binary Search Tree?"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Options List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Options & Correct Answer *
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Option
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Click the green radio circle next to the correct answer.
            </p>

            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const isCorrect = correctIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                      isCorrect ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Correct Radio Selector */}
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(idx)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                        isCorrect
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 text-slate-400 hover:border-teal-400'
                      }`}
                      title="Mark as correct answer"
                    >
                      {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <span className="w-5 text-center font-bold text-xs text-slate-500 shrink-0">
                      {letters[idx]}
                    </span>

                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${letters[idx]}`}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Explanation (Revealed in Quiz Review)
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer is right and why other options are wrong..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              {initialData ? 'Update Question' : 'Save Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
