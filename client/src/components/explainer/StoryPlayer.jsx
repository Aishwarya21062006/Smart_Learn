import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Compass,
  Layers
} from 'lucide-react';
import CharacterAvatar from './CharacterAvatar.jsx';
import VoiceControls from './VoiceControls.jsx';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import explainerService from '../../services/explainerService.js';

export const StoryPlayer = ({
  topicId,
  storyboard,
  concepts = [],
  activeConcept = 'Module Overview',
  onSwitchConcept
}) => {
  const navigate = useNavigate();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showCheckQuestion, setShowCheckQuestion] = useState(false);

  // Check Question State
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnsweredCheck, setHasAnsweredCheck] = useState(false);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackHelped, setFeedbackHelped] = useState(null);

  // Reset progress when concept changes
  useEffect(() => {
    setCurrentSceneIndex(0);
    setShowCheckQuestion(false);
    setSelectedOption(null);
    setHasAnsweredCheck(false);
    setFeedbackSubmitted(false);
  }, [activeConcept]);

  const scenes = storyboard?.scenes || [];
  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const isLastScene = currentSceneIndex === scenes.length - 1;
  const checkQuestion = storyboard?.checkQuestion;

  const handleNext = () => {
    if (isLastScene) {
      setShowCheckQuestion(true);
    } else {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (showCheckQuestion) {
      setShowCheckQuestion(false);
    } else if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSceneIndex(0);
    setShowCheckQuestion(false);
    setSelectedOption(null);
    setHasAnsweredCheck(false);
  };

  const handleOptionSelect = (index) => {
    if (hasAnsweredCheck) return;
    setSelectedOption(index);
    setHasAnsweredCheck(true);

    const isCorrect = index === checkQuestion?.correctIndex;
    explainerService.submitFeedback(topicId, {
      helped: isCorrect,
      checkScore: isCorrect ? 100 : 0
    }).catch(err => console.warn('Could not submit check feedback:', err.message));
  };

  const handleFeedback = async (helped) => {
    setFeedbackHelped(helped);
    setFeedbackSubmitted(true);
    try {
      await explainerService.submitFeedback(topicId, { helped });
    } catch (err) {
      console.warn('Feedback submission error:', err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Header & Stage Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Anime Visual Novel
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Sensei Hana & Ren
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {storyboard.topicTitle}
            </h2>
            {storyboard.synopsis && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {storyboard.synopsis}
              </p>
            )}
          </div>

          {/* Scene Progress & Voice Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {showCheckQuestion ? 'Checkpoint' : `Scene ${currentSceneIndex + 1} of ${scenes.length}`}
            </span>
            <VoiceControls
              currentScene={showCheckQuestion ? null : currentScene}
              isAutoVoiceEnabled={isVoiceEnabled}
              onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
            />
          </div>
        </div>

        {/* Concept Switcher Ribbon */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Active Focus:</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-purple-600 text-white shadow-sm truncate max-w-[280px]">
              {activeConcept || 'Module Overview'}
            </span>
          </div>

          {concepts.length > 0 && onSwitchConcept && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Explain Another Concept:</span>
              <select
                value={activeConcept}
                onChange={(e) => onSwitchConcept(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-purple-300 rounded-lg bg-white text-purple-900 font-medium shadow-sm max-w-[300px] truncate focus:ring-purple-500"
              >
                <option value="Module Overview">🌟 Entire Module Overview</option>
                {concepts.map((c, idx) => (
                  <option key={idx} value={c}>🎯 {c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Novel Stage */}
      {!showCheckQuestion ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 shadow-xl p-6 sm:p-10 min-h-[500px] flex flex-col justify-between">
          {/* Subtle anime grid / classroom pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

          {/* Stage Directions / Visual Cue Banner */}
          <div className="relative z-10 mx-auto max-w-lg mb-4">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600/60 rounded-full px-4 py-1.5 text-center text-xs text-slate-300 shadow-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="italic">{currentScene?.visualCue}</span>
            </div>
          </div>

          {/* Characters Display */}
          <div className="relative z-10 flex items-end justify-around my-auto px-4 sm:px-12 gap-8">
            {/* Sensei Hana */}
            <CharacterAvatar
              character="Sensei Hana"
              emotion={currentScene?.speaker === 'Sensei Hana' ? currentScene.emotion : 'neutral'}
              isSpeaking={currentScene?.speaker === 'Sensei Hana'}
            />

            {/* Ren */}
            <CharacterAvatar
              character="Ren"
              emotion={currentScene?.speaker === 'Ren' ? currentScene.emotion : 'neutral'}
              isSpeaking={currentScene?.speaker === 'Ren'}
            />
          </div>

          {/* Dialogue Box */}
          <div className="relative z-10 mt-6">
            <div
              className={`rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl border-2 transition-all duration-300 ${
                currentScene?.speaker === 'Sensei Hana'
                  ? 'bg-purple-950/90 border-purple-400/50 shadow-purple-950/50'
                  : 'bg-teal-950/90 border-teal-400/50 shadow-teal-950/50'
              }`}
            >
              {/* Speaker Nameplate */}
              <div className="inline-block px-3.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider mb-2.5 shadow-sm text-white bg-slate-900 border border-slate-700">
                {currentScene?.speaker}
              </div>

              {/* Spoken Text */}
              <p className="text-base sm:text-lg text-white font-medium leading-relaxed min-h-[56px] select-none">
                "{currentScene?.dialogue}"
              </p>

              {/* Navigation Controls */}
              <div className="mt-4 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentSceneIndex === 0}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {/* Scene Indicator Dots */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {scenes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSceneIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentSceneIndex
                          ? 'bg-purple-400 w-6'
                          : idx < currentSceneIndex
                          ? 'bg-slate-400'
                          : 'bg-slate-700'
                      }`}
                      title={`Jump to Scene ${idx + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  className={
                    isLastScene
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/20'
                      : 'bg-purple-600 hover:bg-purple-700 text-white font-semibold'
                  }
                >
                  <span>{isLastScene ? 'Check Understanding' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* End-of-Story Comprehension Checkpoint Screen */
        <Card className="p-6 sm:p-10 border-2 border-purple-200 shadow-xl bg-white space-y-8 animate-fade-in">
          <div className="text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Sensei's Comprehension Check
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Topic: <span className="font-bold text-purple-700">{activeConcept}</span>
            </p>
          </div>

          {/* Interactive Check Question */}
          {checkQuestion && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 max-w-2xl mx-auto space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {checkQuestion.question}
              </h4>

              <div className="space-y-2.5">
                {checkQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === checkQuestion.correctIndex;

                  let optClass = 'bg-white border-slate-200 text-slate-800 hover:border-purple-300';
                  if (hasAnsweredCheck) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-200';
                    } else if (isSelected) {
                      optClass = 'bg-rose-50 border-rose-300 text-rose-900';
                    } else {
                      optClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnsweredCheck}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full p-3.5 text-left rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {hasAnsweredCheck && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {hasAnsweredCheck && (
                <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed animate-fade-in">
                  <span className="font-bold block mb-1">
                    {selectedOption === checkQuestion.correctIndex ? '🎉 Spot on!' : '💡 Sensei explains:'}
                  </span>
                  {checkQuestion.explanation}
                </div>
              )}
            </div>
          )}

          {/* Explainer Feedback Box */}
          <div className="bg-slate-50 rounded-xl p-5 text-center max-w-md mx-auto border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Did Sensei Hana and Ren help you understand this concept?
            </p>
            {feedbackSubmitted ? (
              <p className="text-xs font-bold text-teal-700 flex items-center justify-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Thank you! Your feedback helps calibrate the AI story generator.
              </p>
            ) : (
              <div className="flex items-center justify-center gap-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="text-xs hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Yes, it helped!
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="text-xs hover:border-rose-400 hover:bg-rose-50"
                >
                  <ThumbsDown className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  Still confused
                </Button>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="border-slate-300 text-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Replay Concept
            </Button>

            <Link to={`/topics/${topicId}`}>
              <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                <BookOpen className="w-4 h-4 mr-1.5" />
                Back to Module Notes
              </Button>
            </Link>

            <Link to={`/topics/${topicId}/quiz`}>
              <Button variant="primary" className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-md">
                <span>Take Topic Quiz Now</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StoryPlayer;
