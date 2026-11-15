import { useState } from 'react';
import { GraduationCap, User, Sparkles, HelpCircle, Smile, AlertCircle, Lightbulb } from 'lucide-react';

export const CharacterAvatar = ({ character, emotion = 'neutral', isSpeaking = false }) => {
  const isHana = character === 'Sensei Hana';
  const [imageLoaded, setImageLoaded] = useState(true);

  const imageSrc = isHana ? '/avatars/sensei-hana.jpg' : '/avatars/ren.jpg';

  const emotionDetails = {
    neutral: { label: 'Attentive', icon: Sparkles, color: 'text-slate-700 bg-slate-100 border-slate-300' },
    happy: { label: 'Encouraging', icon: Smile, color: 'text-emerald-800 bg-emerald-100 border-emerald-300' },
    thinking: { label: 'Thinking...', icon: HelpCircle, color: 'text-amber-800 bg-amber-100 border-amber-300' },
    surprised: { label: 'Curious!', icon: AlertCircle, color: 'text-rose-800 bg-rose-100 border-rose-300' },
    explaining: { label: 'Explaining', icon: Lightbulb, color: 'text-purple-800 bg-purple-100 border-purple-300' }
  };

  const currentEmotion = emotionDetails[emotion] || emotionDetails.neutral;
  const EmotionIcon = currentEmotion.icon;

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isSpeaking ? 'scale-105 opacity-100 z-20' : 'opacity-70 scale-95 z-10'}`}>
      {/* Anime Character Photo Frame */}
      <div className="relative">
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl transition-all border-4 ${
            isHana
              ? isSpeaking
                ? 'border-purple-400 shadow-purple-500/40 ring-4 ring-purple-300/50'
                : 'border-slate-600 grayscale-[25%]'
              : isSpeaking
              ? 'border-teal-400 shadow-teal-500/40 ring-4 ring-teal-300/50'
              : 'border-slate-600 grayscale-[25%]'
          } bg-slate-800`}
        >
          {imageLoaded ? (
            <img
              src={imageSrc}
              alt={character}
              onError={() => setImageLoaded(false)}
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white ${isHana ? 'bg-gradient-to-tr from-purple-600 to-indigo-700' : 'bg-gradient-to-tr from-teal-500 to-cyan-600'}`}>
              {isHana ? <GraduationCap className="w-14 h-14" /> : <User className="w-14 h-14" />}
            </div>
          )}
        </div>

        {/* Emotion Badge */}
        {isSpeaking && (
          <div className={`absolute -bottom-2.5 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md border ${currentEmotion.color} animate-bounce [animation-duration:2s]`}>
            <EmotionIcon className="w-3 h-3" />
            <span>{currentEmotion.label}</span>
          </div>
        )}
      </div>

      {/* Name Tag */}
      <div className="mt-3 text-center">
        <h4 className={`text-sm sm:text-base font-extrabold tracking-tight ${isSpeaking ? (isHana ? 'text-purple-300' : 'text-teal-300') : 'text-slate-400'}`}>
          {isHana ? 'Sensei Hana' : 'Ren'}
        </h4>
        <span className={`text-[11px] font-semibold block ${isSpeaking ? (isHana ? 'text-purple-400' : 'text-teal-400') : 'text-slate-500'}`}>
          {isHana ? 'Academic Mentor' : 'Curious Student'}
        </span>
      </div>
    </div>
  );
};

export default CharacterAvatar;
