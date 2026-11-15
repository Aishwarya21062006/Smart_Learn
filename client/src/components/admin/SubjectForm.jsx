import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

export const SubjectForm = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Subject title is required.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        description: description.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Subject Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what students will learn in this subject..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              {initialData ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;
