import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, HelpCircle, CheckCircle2, Sparkles, Loader2, X } from 'lucide-react';
import adminService from '../../services/adminService.js';
import QuestionForm from '../../components/admin/QuestionForm.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const ManageQuestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || '';

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // AI Generation State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCount, setAiCount] = useState(5);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // 1. Initial subjects & topics load
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const [subs, tops] = await Promise.all([
          adminService.getSubjects(),
          adminService.getTopics()
        ]);
        setSubjects(subs);
        setTopics(tops);

        if (initialTopicId) {
          const match = tops.find(t => t.id === initialTopicId);
          if (match) {
            setSelectedSubjectId(match.subjectId || '');
            setSelectedTopicId(match.id);
          }
        } else if (subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
          const subTopics = tops.filter(t => t.subjectId === subs[0].id);
          if (subTopics.length > 0) {
            setSelectedTopicId(subTopics[0].id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize questions view');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [initialTopicId]);

  // 2. Fetch questions when selectedTopicId changes
  const fetchQuestions = async (topicId) => {
    if (!topicId) {
      setQuestions([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getQuestions(topicId);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to load questions for this topic');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTopicId) {
      fetchQuestions(selectedTopicId);
    } else {
      setQuestions([]);
    }
  }, [selectedTopicId]);

  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    setSelectedSubjectId(subId);
    const filteredTopics = topics.filter(t => t.subjectId === subId);
    if (filteredTopics.length > 0) {
      setSelectedTopicId(filteredTopics[0].id);
      setSearchParams({ topicId: filteredTopics[0].id });
    } else {
      setSelectedTopicId('');
      setSearchParams({});
    }
  };

  const handleTopicChange = (e) => {
    const topId = e.target.value;
    setSelectedTopicId(topId);
    if (topId) {
      setSearchParams({ topicId: topId });
    } else {
      setSearchParams({});
    }
  };

  const handleSaveQuestion = async (formData) => {
    if (editingQuestion) {
      await adminService.updateQuestion(editingQuestion.id, formData);
    } else {
      await adminService.createQuestion(selectedTopicId, formData);
    }
    await fetchQuestions(selectedTopicId);
  };

  const handleGenerateAi = async () => {
    if (!selectedTopicId) return;

    try {
      setGeneratingAi(true);
      setError(null);
      const res = await adminService.generateQuestions(selectedTopicId, aiCount);
      setAiSuccessMsg(res.message || `Generated ${res.questions?.length} questions!`);
      setIsAiModalOpen(false);
      await fetchQuestions(selectedTopicId);
      setTimeout(() => setAiSuccessMsg(''), 6000);
    } catch (err) {
      alert(`AI Generation error: ${err.message}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleDelete = async (id, questionText) => {
    if (!window.confirm(`Delete question: "${questionText.slice(0, 50)}..."?`)) {
      return;
    }
    try {
      await adminService.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const currentTopic = topics.find(t => t.id === selectedTopicId);
  const filteredTopics = topics.filter(t => t.subjectId === selectedSubjectId);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admin Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Question Bank Manager</h1>
            <p className="text-sm text-slate-500">
              Create and manage multiple-choice evaluation questions manually or generate with AI
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Option 1: AI Generate Button */}
            <Button
              variant="outline"
              disabled={!selectedTopicId}
              onClick={() => setIsAiModalOpen(true)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-purple-600" />
              AI Generate Quiz
            </Button>

            {/* Option 2: Add Manually Button */}
            <Button
              variant="primary"
              disabled={!selectedTopicId}
              onClick={() => {
                setEditingQuestion(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Manually
            </Button>
          </div>
        </div>
      </div>

      {aiSuccessMsg && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">{aiSuccessMsg}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => fetchQuestions(selectedTopicId)} />}

      {/* Selectors Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={handleSubjectChange}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white min-w-[200px]"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Topic
          </label>
          <select
            value={selectedTopicId}
            onChange={handleTopicChange}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white min-w-[220px]"
          >
            {filteredTopics.length === 0 ? (
              <option value="">No topics in this subject</option>
            ) : (
              filteredTopics.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))
            )}
          </select>
        </div>

        {selectedTopicId && (
          <div className="ml-auto text-xs text-slate-500 self-end pb-2">
            Total questions in topic: <span className="font-bold text-slate-900">{questions.length}</span>
          </div>
        )}
      </div>

      {/* Questions List */}
      {loading ? (
        <Loader message="Loading questions..." />
      ) : !selectedTopicId ? (
        <EmptyState
          title="Select a Topic"
          description="Choose a subject and topic from the dropdowns above to manage its questions."
        />
      ) : questions.length === 0 ? (
        <Card className="text-center p-8 bg-white border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No questions in "{currentTopic?.title || 'this topic'}" yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Choose how you would like to build the quiz questions for this topic:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsAiModalOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white shadow"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Generate Questions from Notes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingQuestion(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Question Manually
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="relative">
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  Question #{idx + 1}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.question)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-3">
                {q.question}
              </h4>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {(q.options || []).map((opt, oIdx) => {
                  const isCorrect = q.correct_index === oIdx;

                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] bg-white border border-slate-200">
                          {letters[oIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 uppercase tracking-wider font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal 1: Manual Question Form */}
      <QuestionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveQuestion}
        initialData={editingQuestion}
        topicTitle={currentTopic?.title}
      />

      {/* Modal 2: AI Quiz Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  AI Quiz Generator
                </h3>
              </div>
              <button
                disabled={generatingAi}
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Selected Topic
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {currentTopic?.title}
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-800 leading-relaxed">
                Gemini will read the study notes uploaded for this topic and generate conceptual multiple-choice questions with 4 plausible choices, correct answers, and teacher explanations.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Number of Questions to Generate
                </label>
                <select
                  disabled={generatingAi}
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={3}>3 Questions (Quick Test)</option>
                  <option value={5}>5 Questions (Standard Quiz)</option>
                  <option value={10}>10 Questions (Comprehensive Exam)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  disabled={generatingAi}
                  onClick={() => setIsAiModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={generatingAi}
                  onClick={handleGenerateAi}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Generate Questions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
