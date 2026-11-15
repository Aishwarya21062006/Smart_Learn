import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import explainerService from '../services/explainerService.js';
import StoryPlayer from '../components/explainer/StoryPlayer.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const ExplainerPage = () => {
  const { topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentConcept = searchParams.get('concept') || '';

  const [explainer, setExplainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExplainer = async (targetConcept) => {
    try {
      setLoading(true);
      setError(null);
      const data = await explainerService.getExplainer(topicId, targetConcept || null);
      setExplainer(data);
    } catch (err) {
      setError(err.message || 'Failed to generate visual anime explainer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchExplainer(currentConcept);
    }
  }, [topicId, currentConcept]);

  const handleSwitchConcept = (newConcept) => {
    if (newConcept && newConcept !== 'Module Overview') {
      setSearchParams({ concept: newConcept });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Loader message="Sensei Hana and Ren are analyzing the curriculum and preparing your targeted story..." />
        <p className="text-xs text-slate-400 mt-3">
          {currentConcept ? `Focusing dialogue on: "${currentConcept}"...` : 'Synthesizing character dialogues, metaphors, and comprehension checkpoints...'}
        </p>
      </div>
    );
  }

  if (error || !explainer || !explainer.storyboard) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorMessage
          title="Explainer Generation Failed"
          message={error || 'Unable to load visual novel story.'}
          onRetry={() => fetchExplainer(currentConcept)}
        />
        <div className="mt-4 text-center">
          <Link to={`/topics/${topicId}`} className="text-sm text-teal-600 font-semibold hover:underline">
            ← Return to Study Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={`/topics/${topicId}`}
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Study Notes
        </Link>
      </div>

      {/* Story Player Container */}
      <StoryPlayer
        topicId={topicId}
        storyboard={explainer.storyboard}
        concepts={explainer.concepts || []}
        activeConcept={explainer.activeConcept || currentConcept || 'Module Overview'}
        onSwitchConcept={handleSwitchConcept}
      />
    </div>
  );
};

export default ExplainerPage;
