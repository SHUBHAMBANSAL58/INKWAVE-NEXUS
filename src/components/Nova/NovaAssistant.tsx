import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NovaMessage, NovaMemoryItem } from '../../types';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  Cpu,
  Brain,
  Palette,
  Hammer,
  ShieldAlert,
  Trash2,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

export function NovaAssistant() {
  const { isNovaOpen, setIsNovaOpen, setActiveView, createTask } = useApp();

  const [messages, setMessages] = useState<NovaMessage[]>([
    {
      id: 'nova-init',
      sender: 'nova',
      text: 'Good day, Alex. NOVA command layer is active. All four autonomous intelligences in NEXUS CORE are calibrated and standing by. How may I assist your publishing universe today?',
      timestamp: 'Now',
      suggestedFollowUps: [
        'Ask the PLANNER to map out a 7-day tech series',
        'Analyze my current Creator DNA writing radar',
        'Ask the DESIGNER for glassmorphism tokens',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memories, setMemories] = useState<NovaMemoryItem[]>([]);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load memories
  useEffect(() => {
    fetch('/api/nova/memories')
      .then((res) => res.json())
      .then((data) => setMemories(data.memories || []))
      .catch((e) => console.warn('Memory load notice:', e));
  }, [showMemoryModal]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Text-To-Speech Output
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 200));
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
    }
  };

  // Voice Input Toggle (Web Speech API)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechNotice('Speech recognition is not supported in this browser. Type your command below.');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: NovaMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/nova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const novaMsg: NovaMessage = {
          id: `nova-${Date.now()}`,
          sender: 'nova',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent,
          agentRouted: data.agentRouted,
          actionTaken: data.actionTaken,
          suggestedFollowUps: data.suggestedFollowUps,
        };

        setMessages((prev) => [...prev, novaMsg]);
        speakText(data.reply);
      }
    } catch (err) {
      console.warn('NOVA chat notice:', err);
      const fallbackMsg: NovaMessage = {
        id: `nova-${Date.now()}`,
        sender: 'nova',
        text: 'Autonomous subsystems engaged. All four agents in NEXUS CORE are listening.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await fetch(`/api/nova/memories/${id}`, { method: 'DELETE' });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  if (!isNovaOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out flex flex-col glass-panel shadow-2xl border border-sky-500/40 ${
        isExpanded
          ? 'inset-4 sm:inset-10 rounded-3xl'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] rounded-3xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 rounded-t-3xl">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-[1px]">
            <div className="w-full h-full bg-[var(--bg-primary)] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm font-mono tracking-tight text-[var(--text-primary)]">NOVA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">Digital Operating Layer • NEXUS</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMemoryModal(true)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-sky-400 hover:bg-[var(--bg-secondary)] transition-colors"
            title="Inspect NOVA Privacy-Aware Memory"
          >
            <Brain className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-sky-400 hover:bg-[var(--bg-secondary)] transition-colors"
            title={isSpeakingEnabled ? 'Mute Voice Responses' : 'Enable Voice Responses'}
          >
            {isSpeakingEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsNovaOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-br-none shadow-md shadow-sky-500/15'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Action Banner if routed to agent */}
              {msg.agentRouted && (
                <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Cpu className="w-3.5 h-3.5" /> Routed to {msg.agentRouted.toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      setIsNovaOpen(false);
                      setActiveView('nexus-core');
                    }}
                    className="underline text-sky-300 hover:text-white"
                  >
                    View in NEXUS CORE →
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-[var(--text-muted)] mt-1 px-1">{msg.timestamp}</span>

            {/* Suggested Follow-Ups */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="mt-2 space-y-1.5 max-w-[85%]">
                <p className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Suggested Directives:</p>
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestedFollowUps.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-[11px] px-2.5 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-sky-400 w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-sky-400" />
            <span className="font-mono">NOVA neural processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inline Speech Support Notice */}
      {speechNotice && (
        <div
          role="status"
          className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-mono"
        >
          <span>{speechNotice}</span>
          <button type="button" onClick={() => setSpeechNotice(null)} className="underline hover:text-white ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Voice Status Indicator */}
      {isListening && (
        <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-400 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            NOVA is listening to your voice directive...
          </span>
          <button onClick={() => setIsListening(false)} className="underline hover:text-white">
            Cancel
          </button>
        </div>
      )}

      {/* Input Tray */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 rounded-b-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-sky-400 border border-[var(--border-color)]'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command NOVA or delegate to Planner, Designer, Builder, Tester..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500/50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Memory Management Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 shadow-2xl border border-sky-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-[var(--text-primary)]">NOVA Privacy-Aware Memory</h3>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              Transparent cognitive memory retained exclusively for personalized authoring assistance. You can inspect,
              edit, or purge any retained memories at any time.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-sky-500/10 text-sky-400">
                      {mem.category}
                    </span>
                    <p className="text-[var(--text-primary)] mt-1.5">{mem.content}</p>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Recorded: {mem.createdAt}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border-color)] flex justify-end">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
