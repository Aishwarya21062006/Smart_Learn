import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Link as LinkIcon, UploadCloud, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import adminService from '../../services/adminService.js';

export const TopicForm = ({
  isOpen,
  onClose,
  onSave,
  subjects = [],
  initialData = null,
  selectedSubjectId = ''
}) => {
  const [subjectId, setSubjectId] = useState(selectedSubjectId || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [position, setPosition] = useState(0);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Drag and Drop PDF State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setSubjectId(initialData.subjectId || initialData.subject_id || selectedSubjectId || '');
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setDifficulty(initialData.difficulty || 1);
      setPosition(initialData.position || 0);
      setResources(initialData.resources || []);
    } else {
      setSubjectId(selectedSubjectId || (subjects[0]?.id || ''));
      setTitle('');
      setContent('');
      setDifficulty(1);
      setPosition(0);
      setResources([]);
    }
    setError('');
    setUploadSuccessMsg('');
    setIsUploadingPdf(false);
  }, [initialData, isOpen, selectedSubjectId, subjects]);

  if (!isOpen) return null;

  const handlePdfUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Only .pdf files are supported. Please drop a valid PDF document.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File is too large. Maximum PDF size is 20MB.');
      return;
    }

    try {
      setIsUploadingPdf(true);
      setError('');
      setUploadSuccessMsg('');

      const result = await adminService.uploadPdf(file);

      // Automatically add uploaded PDF to resources list
      const newResource = {
        title: result.title || file.name.replace(/\.pdf$/i, ''),
        type: 'pdf',
        url: result.url
      };

      setResources(prev => [...prev, newResource]);

      // If topic title is empty, prefill with PDF name
      if (!title.trim()) {
        setTitle(newResource.title);
      }

      // Automatically populate Topic Notes with extracted & synthesized concepts
      if (result.extractedNotes && result.extractedNotes.trim()) {
        setContent(result.extractedNotes.trim());
        setUploadSuccessMsg(`"${file.name}" uploaded! Concepts were extracted and generated directly into your Topic Notes.`);
      } else {
        setUploadSuccessMsg(`"${file.name}" uploaded successfully and added to study resources!`);
      }
      setTimeout(() => setUploadSuccessMsg(''), 6000);
    } catch (err) {
      setError(err.message || 'Failed to upload PDF');
    } finally {
      setIsUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handlePdfUpload(file);
    }
  };

  const handleAddResource = () => {
    setResources([...resources, { title: '', type: 'link', url: '' }]);
  };

  const handleRemoveResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleResourceChange = (index, field, value) => {
    const updated = [...resources];
    updated[index][field] = value;
    setResources(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!title.trim()) {
      setError('Topic title is required.');
      return;
    }

    // Validate resources
    for (const res of resources) {
      if (!res.title.trim() || !res.url.trim()) {
        setError('All resources must have both a title and a valid URL.');
        return;
      }
    }

    try {
      setLoading(true);
      await onSave({
        subject_id: subjectId,
        title: title.trim(),
        content: content.trim(),
        difficulty: Number(difficulty),
        position: Number(position),
        resources: resources.map(r => ({
          title: r.title.trim(),
          type: r.type,
          url: r.url.trim()
        }))
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Topic' : 'Add New Topic'}
          </h3>
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

          {uploadSuccessMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="" disabled>Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value={1}>1 - Beginner / Easy</option>
                <option value={2}>2 - Intermediate / Medium</option>
                <option value={3}>3 - Advanced / Hard</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop PDF Box */}
          <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider">
                Upload Notes PDF (Auto-Generates Study Content)
              </label>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                AI Powered Extraction
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Drag & drop lecture slides or textbook PDF. We'll upload it and automatically extract & generate the study notes below.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]);
              }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploadingPdf && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-white ${
                isDragging
                  ? 'border-teal-500 bg-teal-50 scale-[1.01]'
                  : 'border-teal-300 hover:border-teal-500 hover:bg-teal-50/30'
              } ${isUploadingPdf ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {isUploadingPdf ? (
                <div className="flex flex-col items-center py-2 space-y-2">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  <p className="text-xs font-semibold text-teal-900">
                    Extracting concepts & generating structured study notes...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-1">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Drag & drop PDF here, or <span className="text-teal-600 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports .pdf documents up to 20MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Topic Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Binary Search Trees"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sort Position (0-index)
              </label>
              <input
                type="number"
                min={0}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Topic Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Topic Notes & Study Content *
              </label>
              {content && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {content.length} characters
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-1.5">
              Auto-filled when you drop a PDF, or you can edit/type directly. Used by AI Tutor and Anime Explainer.
            </p>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Study notes and concepts will appear here automatically when you drop a PDF, or you can write them manually..."
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 leading-relaxed"
            />
          </div>

          {/* Attached Resources Section */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Study Resources ({resources.length})</h4>
                <p className="text-xs text-slate-500">PDFs, videos, articles, and documentation links</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddResource}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Link Manually
              </Button>
            </div>

            <div className="space-y-3">
              {resources.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No resources attached yet. Drag a PDF above or add links manually.</p>
              ) : (
                resources.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Resource Title (e.g. BST Lecture Slides)"
                        value={item.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <select
                        value={item.type}
                        onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                        className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                        <option value="link">Web Link</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        {item.type === 'pdf' ? (
                          <FileText className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-2.5 pointer-events-none" />
                        ) : (
                          <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        )}
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          value={item.url}
                          onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose} disabled={loading || isUploadingPdf}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading} disabled={isUploadingPdf}>
              {initialData ? 'Update Topic' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicForm;
