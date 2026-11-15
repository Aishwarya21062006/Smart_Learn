import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import Button from '../common/Button.jsx';

export const VoiceControls = ({ currentScene, isAutoVoiceEnabled, onToggleVoice }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const speakCurrentScene = useCallback(() => {
    if (!supported || !window.speechSynthesis || !currentScene) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentScene.dialogue);

    // Differentiate voice characteristics based on speaker
    const isHana = currentScene.speaker === 'Sensei Hana';
    utterance.rate = isHana ? 0.95 : 1.05;
    utterance.pitch = isHana ? 1.2 : 0.95;

    // Pick a preferred voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (isHana) {
        // Prefer female or calm voice for Sensei Hana
        const femaleVoice = voices.find(v =>
          /female|zira|samantha|victoria|karen|moira|google us english/i.test(v.name)
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        // Prefer youthful/male voice for Ren
        const maleVoice = voices.find(v =>
          /male|david|alex|daniel|george|google uk english male/i.test(v.name)
        );
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [currentScene, supported]);

  // Trigger speech when scene changes if auto-voice is enabled
  useEffect(() => {
    if (isAutoVoiceEnabled && currentScene) {
      speakCurrentScene();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScene?.id, isAutoVoiceEnabled, speakCurrentScene]);

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleVoice}
        className={`text-xs px-2.5 py-1.5 transition-all ${
          isAutoVoiceEnabled
            ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm'
            : 'text-slate-500 border-slate-200 hover:bg-slate-50'
        }`}
        title={isAutoVoiceEnabled ? 'Voice narration active (Click to mute)' : 'Enable Voice Narration'}
      >
        {isAutoVoiceEnabled ? (
          <>
            <Volume2 className={`w-3.5 h-3.5 mr-1 text-purple-600 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>Voice: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Voice: OFF</span>
          </>
        )}
      </Button>

      {isAutoVoiceEnabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={speakCurrentScene}
          disabled={isSpeaking}
          className="text-xs px-2 py-1.5 text-slate-600 hover:text-slate-900"
          title="Replay spoken line"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceControls;
