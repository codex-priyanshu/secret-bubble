import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Unlock, Bot } from 'lucide-react';
import { analyzeMessageSensitivity } from '../utils/aiPrivacyDetector';

const DEFAULT_CATEGORIES = [
  { id: 'Adult & Physical Intimacy 🔞', label: 'Intimacy 🔞' },
  { id: 'Romance & Feelings ❤️', label: 'Feelings ❤️' },
  { id: 'Secrets & Confidential 🔒', label: 'Secret 🔒' },
  { id: 'Financial & Credentials 🔑', label: 'Sensitive 🔑' }
];

export default function ChatInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  settings,
  onOpenSettings
}) {
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Adult & Physical Intimacy 🔞');
  const [aiDetection, setAiDetection] = useState({ isSensitive: false });
  const typingTimeoutRef = useRef(null);

  // Live real-time AI Sensitivity scanning as user types
  useEffect(() => {
    if (settings?.aiEnabled && text.trim().length > 1) {
      const result = analyzeMessageSensitivity(text, settings.categories);
      setAiDetection(result);
      if (result.isSensitive) {
        setIsLocked(true);
        setSelectedCategory(result.category);
      }
    } else {
      setAiDetection({ isSensitive: false });
    }

    // Typing notification trigger
    if (text.trim()) {
      if (onTyping) onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) onStopTyping();
      }, 1500);
    } else {
      if (onStopTyping) onStopTyping();
    }
  }, [text, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (onStopTyping) onStopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    let finalLocked = isLocked;
    let finalCategory = selectedCategory;
    let autoShielded = false;

    if (settings?.aiEnabled) {
      const analysis = analyzeMessageSensitivity(text, settings.categories);
      if (analysis.isSensitive) {
        finalLocked = true;
        finalCategory = analysis.category;
        autoShielded = true;
      }
    }

    onSendMessage({
      text: text.trim(),
      isLocked: finalLocked,
      category: finalLocked ? finalCategory : 'General',
      isAiShielded: autoShielded || aiDetection.isSensitive
    });

    setText('');
    setIsLocked(false);
    setAiDetection({ isSensitive: false });
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
      
      {/* AI Live Detection Banner */}
      {aiDetection.isSensitive && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 mb-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/50 text-xs text-rose-200 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </span>
            <span className="truncate">
              <strong>AI Auto-Shield:</strong> "{aiDetection.category}" detected &rarr; <strong>Auto-locked!</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/30 text-[10px] font-bold uppercase tracking-wider text-rose-300 shrink-0">
            Protected
          </span>
        </div>
      )}

      {/* Category selector when Lock is Active */}
      {isLocked && (
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3" />
            Lock Tag:
          </span>
          {DEFAULT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        
        {/* Toggle Lock Button */}
        <button
          type="button"
          onClick={() => setIsLocked(!isLocked)}
          className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-center shrink-0 ${
            isLocked
              ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20 scale-105'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
          }`}
          title={isLocked ? 'Message is locked with Biometrics' : 'Click to manually lock message'}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 animate-pulse text-purple-400" />
          ) : (
            <Unlock className="w-5 h-5" />
          )}
        </button>

        {/* Text Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              settings?.aiEnabled
                ? 'Type message... (AI auto-masks adult/feelings talks)'
                : 'Type message... (Manual Lock mode)'
            }
            className={`w-full px-4 py-3 bg-slate-950 border rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
              isLocked
                ? 'border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 bg-purple-950/10'
                : 'border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }`}
          />
        </div>

        {/* AI Settings Indicator Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`p-3 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 shrink-0 ${
            settings?.aiEnabled
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-sm hover:bg-cyan-900/40'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
          }`}
          title="Configure AI Auto-Detection & Privacy Settings"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI {settings?.aiEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className={`p-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center shrink-0 ${
            text.trim()
              ? isLocked
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}