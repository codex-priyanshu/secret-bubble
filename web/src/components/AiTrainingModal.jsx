import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Plus, Trash2, CheckCircle2, X, Brain, MessageSquare, Terminal, Send } from 'lucide-react';

export default function AiTrainingModal({ isOpen, onClose, backendUrl, currentUser }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('training'); // 'training', 'persona', 'playground'
  const [trainingData, setTrainingData] = useState({
    systemPersona: 'Meta AI - Intelligent Security & Privacy Companion',
    systemInstructions: '',
    trainingPairs: []
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Form states for new rule
  const [newTrigger, setNewTrigger] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // Form states for persona
  const [personaName, setPersonaName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Playground state
  const [testPrompt, setTestPrompt] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/ai/training`);
      const json = await res.json();
      if (json.success && json.data) {
        setTrainingData(json.data);
        setPersonaName(json.data.systemPersona || '');
        setSystemPrompt(json.data.systemInstructions || '');
      }
    } catch (e) {}
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddTrainingPair = async (e) => {
    e.preventDefault();
    if (!newTrigger.trim() || !newResponse.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: newTrigger,
          keywords: newKeywords,
          response: newResponse
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Rule trained and saved successfully!');
        setNewTrigger('');
        setNewKeywords('');
        setNewResponse('');
        fetchTrainingData();
      }
    } catch (err) {
      showToast('Error saving training rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePair = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/api/ai/train/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Rule removed');
        fetchTrainingData();
      }
    } catch (e) {}
  };

  const handleSavePersona = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPersona: personaName,
          systemInstructions: systemPrompt
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('AI Persona & Instructions Updated!');
        fetchTrainingData();
      }
    } catch (e) {
      showToast('Failed to update persona');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = async (e) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestReply('');
    try {
      const res = await fetch(`${backendUrl}/api/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          senderName: currentUser?.name || 'Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestReply(data.response);
      }
    } catch (err) {
      setTestReply('Error communicating with AI test engine.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-600/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI Training & Custom Knowledge Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">PRO</span>
              </h3>
              <p className="text-xs text-slate-400">Teach custom answers, configure persona, and train the AI brain</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Pill */}
        {notification && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold text-center animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 my-3 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'training'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Train Knowledge ({trainingData.trainingPairs?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('persona')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'persona'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Persona & Prompt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playground')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Test Sandbox</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: ADD KNOWLEDGE PAIRS */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              
              {/* Add New Q&A Form */}
              <form onSubmit={handleAddTrainingPair} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Teach AI a New Answer
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Trigger Question / Keyword</label>
                  <input
                    type="text"
                    required
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="e.g. who made secret-bubble, kya hal hai, meri shop ka address"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Alternative Trigger Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    placeholder="e.g. creator, founder, banaya, owner"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected AI Response</label>
                  <textarea
                    required
                    rows={3}
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Enter the exact answer Meta AI should respond with..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Train & Save into AI Brain</span>
                </button>
              </form>

              {/* Trained Rules List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Knowledge Rules ({trainingData.trainingPairs?.length || 0})
                </h4>

                {trainingData.trainingPairs && trainingData.trainingPairs.length > 0 ? (
                  trainingData.trainingPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="p-3.5 bg-slate-800/60 border border-slate-700/70 rounded-2xl flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            TRIGGER:
                          </span>
                          <span className="font-semibold text-white truncate">"{pair.trigger}"</span>
                        </div>
                        {pair.keywords && pair.keywords.length > 0 && (
                          <p className="text-[10px] text-slate-400">
                            Keywords: {pair.keywords.join(', ')}
                          </p>
                        )}
                        <p className="text-slate-300 bg-slate-950/60 p-2 rounded-xl mt-1.5 border border-slate-800 text-[11px] whitespace-pre-wrap">
                          {pair.response}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePair(pair.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition shrink-0"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No custom training pairs added yet.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PERSONA & SYSTEM PROMPT */}
          {activeTab === 'persona' && (
            <form onSubmit={handleSavePersona} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">AI Assistant Name / Title</label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g. Meta AI Assistant"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Master System Prompt & Behavior Instructions</label>
                <textarea
                  rows={5}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define how the AI should talk, tone (formal, friendly, Hinglish slang), privacy guidelines..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This system instruction guides how the AI reasons and speaks across all conversations.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Persona & System Prompt</span>
              </button>
            </form>
          )}

          {/* TAB 3: PLAYGROUND TEST */}
          {activeTab === 'playground' && (
            <div className="space-y-4">
              <form onSubmit={handleRunTest} className="flex gap-2">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Test prompt (e.g. 'who made secret-bubble' or 'kya hal hai')..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={testing}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{testing ? 'Testing...' : 'Test AI'}</span>
                </button>
              </form>

              {testReply && (
                <div className="p-4 bg-slate-950/90 border border-cyan-500/40 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <Bot className="w-4 h-4" />
                    <span>Meta AI Output:</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {testReply}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
