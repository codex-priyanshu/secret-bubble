import React, { useState } from 'react';
import { 
  Users, X, Shield, Lock, Globe, Check, Search, Plus, Sparkles, AlertCircle 
} from 'lucide-react';

const GRADIENT_PRESETS = [
  { id: 'purple', name: 'Cyber Purple', gradient: 'from-purple-600 via-indigo-600 to-cyan-500' },
  { id: 'emerald', name: 'Emerald Wave', gradient: 'from-emerald-600 via-teal-600 to-cyan-500' },
  { id: 'rose', name: 'Sunset Rose', gradient: 'from-rose-600 via-pink-600 to-amber-500' },
  { id: 'amber', name: 'Solar Amber', gradient: 'from-amber-600 via-orange-600 to-rose-500' },
  { id: 'blue', name: 'Deep Indigo', gradient: 'from-blue-600 via-indigo-600 to-purple-600' }
];

export default function CreateGroupModal({
  isOpen,
  onClose,
  currentUser,
  users = [],
  backendUrl,
  onGroupCreated
}) {
  if (!isOpen) return null;

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].gradient);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [searchMember, setSearchMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter out current user and Meta AI bot from selectable member list
  const availableUsers = users.filter(u => 
    u.id !== currentUser?.id && u.id !== 'user-meta-ai' && !u.isBot
  );

  const filteredUsers = availableUsers.filter(u =>
    u.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchMember.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMemberIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.length === availableUsers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(availableUsers.map(u => u.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: groupName.trim(),
        description: description.trim(),
        isPrivate,
        avatarColor: selectedGradient,
        memberIds: selectedMemberIds,
        createdBy: currentUser?.id
      };

      const res = await fetch(`${backendUrl}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create group');
      }

      if (onGroupCreated) {
        onGroupCreated(data.group);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Network error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${selectedGradient} flex items-center justify-center text-white shadow-lg shadow-purple-600/30 transition-all duration-300`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Create New Telegram Group</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">COMMUNITY</span>
              </h3>
              <p className="text-xs text-slate-400">Start a group chat with friends or community members</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
          
          {/* 1. Group Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Group Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Friends Circle, Crypto Gang, Study Room"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* 2. Group Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Description / Topic (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* 3. Group Color Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Avatar Theme
            </label>
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedGradient(p.gradient)}
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${p.gradient} flex items-center justify-center text-white transition-all transform shrink-0 ${
                    selectedGradient === p.gradient ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={p.name}
                >
                  {selectedGradient === p.gradient && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Public vs Private Group */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Privacy
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                  !isPrivate
                    ? 'bg-purple-600/20 border-purple-500 text-purple-100 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Public Group</span>
                </div>
                <p className="text-[11px] text-slate-400">Anyone can discover & join from the groups list</p>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition ${
                  isPrivate
                    ? 'bg-purple-600/20 border-purple-500 text-purple-100 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Private Group</span>
                </div>
                <p className="text-[11px] text-slate-400">Only invited members can see and chat</p>
              </button>
            </div>
          </div>

          {/* 5. Member Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Add Members ({selectedMemberIds.length} selected)
              </label>
              {availableUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                >
                  {selectedMemberIds.length === availableUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Member search */}
            {availableUsers.length > 4 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="max-h-44 overflow-y-auto space-y-1.5 p-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedMemberIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-600/25 border border-purple-500/50 text-white'
                          : 'hover:bg-slate-900 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${user.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{user.username}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-5 text-slate-500 text-xs">
                  {availableUsers.length === 0
                    ? 'No other users registered yet. You can still create the group!'
                    : 'No members matched your search.'}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Creating Group...' : 'Create Telegram Group'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
