import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, BookOpen, Clock, AlertCircle, CheckCircle2, User, RefreshCw } from 'lucide-react';
import tutorService from '../services/tutorService.js';
import learningService from '../services/learningService.js';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export const TutorPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'tutor',
      text: `Hello! I'm your SmartLearn AI College Tutor. I'm connected to all the notes and study documents uploaded to your curriculum.\n\nAsk me any concept, formula, or exam question, and I'll explain it clearly step-by-step!`,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quota State
  const [usage, setUsage] = useState({ used: 0, remaining: 20, limit: 20 });
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Topic filter
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial metadata and quota fetch
  useEffect(() => {
    const init = async () => {
      try {
        const [usageData, topicsData] = await Promise.allSettled([
          tutorService.getUsage(),
          learningService.getTopics ? learningService.getTopics() : Promise.resolve([])
        ]);

        if (usageData.status === 'fulfilled') setUsage(usageData.value);
        if (topicsData.status === 'fulfilled' && Array.isArray(topicsData.value)) {
          setTopics(topicsData.value);
        }
      } catch (err) {
        console.warn('Tutor init error:', err);
      } finally {
        setLoadingUsage(false);
      }
    };

    init();
  }, []);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading || usage.remaining <= 0) return;

    setError(null);
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await tutorService.sendMessage(text, selectedTopicId || null);

      const tutorMsg = {
        id: `tutor-${Date.now()}`,
        role: 'tutor',
        text: res.answer,
        sources: res.sources || []
      };

      setMessages(prev => [...prev, tutorMsg]);
      if (res.usage) {
        setUsage(res.usage);
      }
    } catch (err) {
      setError(err.message || 'Failed to get answer from AI Tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Explain the steps of the engineering research process',
    'What are the common types of research misconduct?',
    'What is a working hypothesis and why is it needed?',
    'Give me 3 common viva questions on this curriculum'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Tutor Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Curriculum Tutor</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                RAG Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded in your uploaded lecture notes and study PDFs using semantic vector search
            </p>
          </div>
        </div>

        {/* Quota & Topic Filter */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
          {/* Topic Scope Selector */}
          {topics.length > 0 && (
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 max-w-[180px] truncate"
            >
              <option value="">All Topics & Notes</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}

          {/* Daily Quota Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
              usage.remaining > 5
                ? 'bg-teal-50 border-teal-200 text-teal-800'
                : usage.remaining > 0
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{usage.remaining} / {usage.limit} messages today</span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Chat Messages Feed Container */}
      <Card className="min-h-[500px] max-h-[620px] flex flex-col justify-between p-0 overflow-hidden bg-slate-50/50 border-slate-200 shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'tutor' && (
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Grounding Source Citation Badges */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-teal-600" />
                      Grounded in:
                    </span>
                    {msg.sources.map((s, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs text-slate-500 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>Searching curriculum vector chunks and generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Try asking:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                disabled={loading || usage.remaining <= 0}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          {usage.remaining <= 0 ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-800 font-medium">
              You have reached your daily quota of 20 messages. Quota resets at midnight UTC. You can continue studying notes and taking quizzes!
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask about formulas, mechanisms, code, or viva concepts..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!input.trim() || loading}
                className="shrink-0 px-4 py-2.5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TutorPage;
