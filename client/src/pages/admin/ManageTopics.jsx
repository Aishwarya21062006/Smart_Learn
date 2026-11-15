import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import adminService from '../../services/adminService.js';
import TopicForm from '../../components/admin/TopicForm.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const ManageTopics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectIdFilter = searchParams.get('subjectId') || '';

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [reindexingId, setReindexingId] = useState(null);
  const [reindexSuccess, setReindexSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjectsData, topicsData] = await Promise.all([
        adminService.getSubjects(),
        adminService.getTopics(subjectIdFilter || null)
      ]);
      setSubjects(subjectsData);
      setTopics(topicsData);
    } catch (err) {
      setError(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subjectIdFilter]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ subjectId: val });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenEdit = async (topicSummary) => {
    try {
      setFormLoading(true);
      const fullTopic = await adminService.getTopicById(topicSummary.id);
      setEditingTopic(fullTopic);
      setIsFormOpen(true);
    } catch (err) {
      alert(`Could not load topic details: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (editingTopic) {
      await adminService.updateTopic(editingTopic.id, data);
    } else {
      await adminService.createTopic(data);
    }
    await loadData();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await adminService.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleReindex = async (id, title) => {
    try {
      setReindexingId(id);
      await adminService.reindexTopic(id);
      setReindexSuccess(`Topic "${title}" re-indexed successfully!`);
      setTimeout(() => setReindexSuccess(null), 4000);
    } catch (err) {
      alert(`Reindexing failed: ${err.message}`);
    } finally {
      setReindexingId(null);
    }
  };

  const difficultyBadge = (level) => {
    if (level === 3) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700">Hard</span>;
    if (level === 2) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Medium</span>;
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Easy</span>;
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Topics</h1>
            <p className="text-sm text-slate-500">
              Create and manage study content, difficulty ratings, and reference resources
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingTopic(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Topic
          </Button>
        </div>
      </div>

      {reindexSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reindexSuccess}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Filter by Subject:
        </label>
        <select
          value={subjectIdFilter}
          onChange={handleFilterChange}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-teal-500 focus:border-teal-500 max-w-xs"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader message="Loading topics..." />
      ) : topics.length === 0 ? (
        <EmptyState
          title="No topics found"
          description={subjectIdFilter ? "No topics found for this subject." : "No topics created yet."}
          actionLabel="Add Topic"
          onAction={() => {
            setEditingTopic(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Position</th>
                <th className="px-6 py-3.5">Topic Title</th>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Difficulty</th>
                <th className="px-6 py-3.5">Resources</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topics.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    #{t.position + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {t.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {t.subjectTitle}
                  </td>
                  <td className="px-6 py-4">
                    {difficultyBadge(t.difficulty)}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {t.resourcesCount} item{t.resourcesCount === 1 ? '' : 's'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        disabled={reindexingId === t.id}
                        onClick={() => handleReindex(t.id, t.title)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Re-index topic chunks & embeddings"
                      >
                        <RefreshCw className={`w-4 h-4 ${reindexingId === t.id ? 'animate-spin text-purple-600' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit topic"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      <TopicForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        subjects={subjects}
        initialData={editingTopic}
        selectedSubjectId={subjectIdFilter}
      />
    </div>
  );
};

export default ManageTopics;
