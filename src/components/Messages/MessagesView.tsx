import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OTHER_USERS } from '../../mockData';
import { MessageSquare, Send, CheckCircle, Shield } from 'lucide-react';

export function MessagesView() {
  const { messages, sendMessage, currentUser } = useApp();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(OTHER_USERS[0].id);
  const [inputText, setInputText] = useState('');

  const activeContact = OTHER_USERS.find((u) => u.id === selectedRecipientId) || OTHER_USERS[0];

  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === activeContact.id) ||
      (m.senderId === activeContact.id && m.recipientId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(activeContact.id, inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Peer Communication
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Encrypted Direct Channels</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Direct Messages</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Collaborate directly with researchers, designers, and fellow creators across INKWAVE.
          </p>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 md:h-[580px] rounded-3xl glass-panel border border-[var(--border-color)] overflow-hidden">
        {/* Contacts Column */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[var(--border-color)] p-4 space-y-2 max-h-52 md:max-h-none overflow-y-auto">
          <p className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-semibold px-2 mb-2">
            Active Conversations
          </p>
          {OTHER_USERS.map((contact) => {
            const isSelected = contact.id === activeContact.id;
            return (
              <button
                type="button"
                key={contact.id}
                aria-pressed={isSelected}
                onClick={() => setSelectedRecipientId(contact.id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isSelected
                    ? 'bg-sky-500/15 border border-sky-500/30 shadow-sm'
                    : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-transparent'
                }`}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--bg-primary)] absolute bottom-0 right-0" />
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-[var(--text-primary)]">{contact.name}</span>
                    {contact.isVerified && <CheckCircle className="w-3 h-3 text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">@{contact.username}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conversation Stream Column */}
        <div className="md:col-span-8 flex flex-col justify-between min-h-[380px] md:h-full bg-[var(--bg-secondary)]/20">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--bg-secondary)]/40">
            <img src={activeContact.avatar} alt={activeContact.name} className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="font-bold text-xs text-[var(--text-primary)]">{activeContact.name}</p>
              <p className="text-[10px] text-emerald-400 font-mono">Online • End-to-End Encrypted</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {threadMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-br-none shadow-md shadow-sky-500/10'
                        : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1 font-mono">{msg.createdAt}</span>
                </div>
              );
            })}
          </div>

          {/* Input Tray */}
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-color)] flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeContact.name}...`}
              className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              aria-label={`Send message to ${activeContact.name}`}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
