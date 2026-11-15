import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Clock,
  X,
  Compass,
  ArrowRight,
  Search
} from 'lucide-react';
import learningService from '../services/learningService.js';
import explainerService from '../services/explainerService.js';
import ResourceList from '../components/learning/ResourceList.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const TopicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Concept Selector Modal State
  const [isConceptModalOpen, setIsConceptModalOpen] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [customConcept, setCustomConcept] = useState('');
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [loadingConcepts, setLoadingConcepts] = useState(false);

  const filteredConcepts = concepts.filter((c) =>
    c.toLowerCase().includes(topicSearchQuery.toLowerCase())
  );

  const fetchTopic = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await learningService.getTopic(id);
      setTopic(data);
    } catch (err) {
      setError(err.message || 'Failed to load topic notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const handleOpenConceptModal = async () => {
    setIsConceptModalOpen(true);
    setTopicSearchQuery('');
    if (concepts.length === 0) {
      try {
        setLoadingConcepts(true);
        const data = await explainerService.getConcepts(id);
        if (data && Array.isArray(data.concepts)) {
          setConcepts(data.concepts);
          if (data.concepts.length > 0 && !selectedConcept) {
            setSelectedConcept(data.concepts[0]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch concepts:', err.message);
      } finally {
        setLoadingConcepts(false);
      }
    }
  };

  const handleStartExplainer = () => {
    const target = customConcept.trim() || selectedConcept || '';
    setIsConceptModalOpen(false);
    if (target && target !== 'Module Overview') {
      navigate(`/explainer/${id}?concept=${encodeURIComponent(target)}`);
    } else {
      navigate(`/explainer/${id}`);
    }
  };

  if (loading) {
    return <Loader message="Loading topic notes and resources..." />;
  }

  if (error || !topic) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage
          title="Topic not found"
          message={error || 'Unable to retrieve the requested study notes.'}
          onRetry={fetchTopic}
        />
      </div>
    );
  }

  const { title, content, difficulty, subjectId, subjectTitle, resources = [], progress } = topic;
  const difficultyLabels = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/subjects/${subjectId}`}
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to {subjectTitle}
        </Link>
      </div>

      {/* Topic Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              {subjectTitle}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {difficultyLabels[difficulty] || 'Standard'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {progress?.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed ({progress.masteryScore}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Clock className="w-3.5 h-3.5" />
                In Progress
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>

        {/* Action Callouts */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Studying this module? If any specific sub-topic is confusing, let Sensei & Ren break it down!
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenConceptModal}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              I didn't understand this
            </Button>

            <Link to={`/topics/${id}/quiz`}>
              <Button variant="primary" size="sm">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                Take Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Study Notes Content */}
      <Card className="prose prose-slate max-w-none p-6 sm:p-8">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-4 border-b border-slate-100 pb-3">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <span>Study Notes</span>
        </div>

        {content ? (
          <div className="whitespace-pre-wrap text-slate-700 text-base leading-relaxed font-sans space-y-4">
            {content}
          </div>
        ) : (
          <p className="text-slate-400 italic text-center py-8">
            No study notes written for this topic yet.
          </p>
        )}
      </Card>

      {/* External Resources Section */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Recommended Study Resources
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Hand-picked supplementary links, videos, and articles to deepen your understanding.
        </p>
        <ResourceList resources={resources} />
      </Card>

      {/* Concept Selector Modal */}
      {isConceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">What topic are you confused about?</h3>
                  <p className="text-xs text-slate-500">Pick any main topic or bold concept from the notes, and Sensei Hana will break it down!</p>
                </div>
              </div>
              <button
                onClick={() => setIsConceptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingConcepts ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <div className="inline-block animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                <p>Scanning module notes for bold headings and main topics...</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Search Bar for fast filtering among all topics */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Module Topics ({concepts.length} extracted):
                    </label>
                    {topicSearchQuery && (
                      <span className="text-[11px] text-purple-600 font-semibold">
                        {filteredConcepts.length} matched
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={topicSearchQuery}
                      onChange={(e) => setTopicSearchQuery(e.target.value)}
                      placeholder={`Search among all ${concepts.length} main topics...`}
                      className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                    {topicSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTopicSearchQuery('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Topics Container */}
                <div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/70">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConcept('Module Overview');
                        setCustomConcept('');
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        selectedConcept === 'Module Overview' && !customConcept
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🌟 Entire Module Overview
                    </button>

                    {filteredConcepts.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedConcept(c);
                          setCustomConcept('');
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium text-left transition-all ${
                          selectedConcept === c && !customConcept
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                        }`}
                      >
                        🎯 {c}
                      </button>
                    ))}

                    {filteredConcepts.length === 0 && (
                      <div className="w-full py-4 text-center text-xs text-slate-400">
                        No topic matching "{topicSearchQuery}". You can type your doubt below!
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Topic / Doubt Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Or type your specific doubt or question:
                  </label>
                  <input
                    type="text"
                    value={customConcept}
                    onChange={(e) => setCustomConcept(e.target.value)}
                    placeholder="e.g., Difference between fabrication and falsification..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sensei Hana will tailor the anime visual novel specifically to whatever you choose or type!
                  </p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConceptModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartExplainer}
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Start Anime Explainer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicPage;
