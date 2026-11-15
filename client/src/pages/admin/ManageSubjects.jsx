import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService.js';
import SubjectForm from '../../components/admin/SubjectForm.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

export const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateOrUpdate = async (data) => {
    if (editingSubject) {
      await adminService.updateSubject(editingSubject.id, data);
    } else {
      await adminService.createSubject(data);
    }
    await fetchSubjects();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove all topics and resources within it.`)) {
      return;
    }
    try {
      setDeletingId(id);
      await adminService.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Subjects</h1>
            <p className="text-sm text-slate-500">
              Create and maintain learning subjects and curriculum tracks
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingSubject(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSubjects} />}

      {loading ? (
        <Loader message="Loading subjects..." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects created yet"
          description="Click 'Add Subject' above to create your first learning subject."
          actionLabel="Add Subject"
          onAction={() => {
            setEditingSubject(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subj) => (
            <Card key={subj.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    <Layers className="w-3.5 h-3.5" />
                    {subj.topicCount} Topics
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{subj.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-3">
                  {subj.description || 'No description added.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/admin/topics?subjectId=${subj.id}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Topics →
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSubject(subj);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit subject"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    disabled={deletingId === subj.id}
                    onClick={() => handleDelete(subj.id, subj.title)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <SubjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingSubject}
      />
    </div>
  );
};

export default ManageSubjects;
