import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Video,
  Image as ImageIcon,
  Music,
  Send,
  Database,
  Globe,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  saveChatMessageToFirestore,
  subscribeToChatMessages,
} from '../../services/firestoreSync';

type StudioTab = 'chat' | 'voice' | 'video' | 'image' | 'music' | 'database';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingChunks?: any[];
  modelUsed?: string;
  roleUsed?: string;
}

export function CosmicAiStudioView() {
  const { setActiveView, addPost } = useApp();

  const [activeTab, setActiveTab] = useState<StudioTab>('chat');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Welcome to the INKWAVE Cosmic Intelligence Suite. Powered by Gemini 4 Argon, Gemini 4 Hydrogen, and Cloud SQL. How may I assist your publishing or architectural exploration today?',
      timestamp: 'Just now',
      modelUsed: 'gemini-4-hydrogen',
      roleUsed: 'cosmic-publisher',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite'>('gemini-4-hydrogen');
  const [selectedRole, setSelectedRole] = useState<'cosmic-publisher' | 'architecture-reviewer' | 'storyteller' | 'editorial-critic'>('cosmic-publisher');
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [enableMaps, setEnableMaps] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [studioError, setStudioError] = useState<string | null>(null);

  // Voice State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('A celestial library hovering at the event horizon of a neon violet black hole');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoDuration, setVideoDuration] = useState<'5s' | '10s'>('10s');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [videoInputImage, setVideoInputImage] = useState<string | null>(null);

  // Image State
  const [imagePrompt, setImagePrompt] = useState('Cosmic architecture blueprint, iridescent cyan lines on obsidian stone, high detail, masterpiece');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState<boolean>(false);

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('Atmospheric interstellar synthesizer arpeggios with deep celestial bassline');
  const [musicModelType, setMusicModelType] = useState<'clip' | 'full'>('clip');
  const [musicResult, setMusicResult] = useState<{ audioUrl?: string; lyrics?: string } | null>(null);
  const [isMusicGenerating, setIsMusicGenerating] = useState<boolean>(false);
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);
  const synthAudioRef = useRef<{
    ctx: AudioContext;
    oscs: OscillatorNode[];
    timer?: ReturnType<typeof setTimeout>;
  } | null>(null);

  // Database State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);

  // Copy feedback helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Listen to Firebase Auth state + cleanup audio/animation refs on unmount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => {
      unsubscribe();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close?.().catch(() => {});
      }
      if (synthAudioRef.current) {
        if (synthAudioRef.current.timer) clearTimeout(synthAudioRef.current.timer);
        synthAudioRef.current.oscs.forEach((o) => {
          try { o.stop(); } catch {}
        });
        synthAudioRef.current.ctx.close?.().catch(() => {});
        synthAudioRef.current = null;
      }
    };
  }, []);

  // Fetch Cloud SQL status and chat sessions
  useEffect(() => {
    fetchDbStatus();
    fetchChatSessions();
  }, []);

  // Subscribe to Firestore persistent cached chat messages
  useEffect(() => {
    const uid = firebaseUser?.uid || 'creator-alex';
    const unsubscribe = subscribeToChatMessages(uid, (cachedMsgs) => {
      if (cachedMsgs.length > 0) {
        setChatMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const formatted = cachedMsgs.map((cm) => ({
            id: cm.id,
            role: cm.role as 'user' | 'model',
            text: cm.text,
            timestamp: new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: cm.modelUsed,
          }));
          const newOnes = formatted.filter((m) => !ids.has(m.id));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      }
    });
    return () => unsubscribe();
  }, [firebaseUser]);

  // Request browser geolocation for Maps Grounding
  useEffect(() => {
    if (enableMaps && !userCoords && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation notice:', err.message);
        }
      );
    }
  }, [enableMaps]);

  const fetchDbStatus = async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.warn('DB status notice:', e);
    } finally {
      setIsDbLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const res = await fetch('/api/db/chats');
      if (res.ok) {
        const data = await res.json();
        if (data.chats) setSavedSessions(data.chats);
      }
    } catch (e) {
      console.warn('Chat sessions notice:', e);
    }
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Firebase Google Auth notice:', err);
    }
  };

  const handleSignOutGoogle = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
  };

  // 1. Send Chat Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    const uid = auth.currentUser?.uid || 'creator-alex';
    saveChatMessageToFirestore(uid, 'user', userText, selectedModel).catch(() => {});

    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      setStudioError(null);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          model: selectedModel,
          role: selectedRole,
          enableSearch,
          enableMaps,
          userLocation: userCoords,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingChunks: data.groundingChunks,
          modelUsed: data.modelUsed,
          roleUsed: data.role,
        };
        setChatMessages((prev) => [...prev, modelMsg]);
        saveChatMessageToFirestore(uid, 'model', data.reply, data.modelUsed).catch(() => {});
        fetchChatSessions();
      } else {
        const errPayload = await res.json().catch(() => ({}));
        setStudioError(errPayload.error || `Chat request failed with HTTP ${res.status}.`);
      }
    } catch (err) {
      console.warn('Chat API notice:', err);
      setStudioError('Unable to reach /api/ai/chat right now. Displayed cached offline synthesis.');
      const fallbackMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        text: `Offline synthesis for "${userText}": Backend connection temporarily unavailable.`,
        timestamp: 'Just now',
        modelUsed: selectedModel,
        roleUsed: selectedRole,
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Microphone Recording & Transcription via gemini-3.5-transcribe
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start Web Audio Frequency Spectrum Visualizer
      setupAudioVisualizer(stream);
    } catch (err) {
      console.warn('Mic access notice:', err);
      setTranscribedText('Microphone permission needed to record live speech. Using sample transcription.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const canvas = voiceCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + dataArray[i] / 400})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) {
      console.warn('Visualizer notice:', e);
    }
  };

  const sendAudioForTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: blob.type || 'audio/webm',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setTranscribedText(data.transcript);
        }
        setIsTranscribing(false);
      };
    } catch (err) {
      console.warn('Transcription error:', err);
      setIsTranscribing(false);
    }
  };

  // 3. Video Generation using gemini-omni-1.2-flash
  const handleGenerateVideo = async () => {
    if (!videoPrompt || isVideoGenerating) return;
    setIsVideoGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
          duration: videoDuration,
          imageBase64: videoInputImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStudioError(errData.error || `Video generation returned HTTP ${res.status}.`);
      }
    } catch (e) {
      console.warn('Video generator notice:', e);
      setStudioError('Video generation request failed. Please check server connectivity.');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  // 4. Image Generation using gemini-nano-banana-2.1
  const handleGenerateImage = async () => {
    if (!imagePrompt || isImageGenerating) return;
    setIsImageGenerating(true);
    setGeneratedImageUrl(null);
    setStudioError(null);

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          imageSize: '1K',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedImageUrl(data.imageUrl);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStudioError(errData.error || `Image generation returned HTTP ${res.status}.`);
      }
    } catch (e) {
      console.warn('Image generator notice:', e);
      setStudioError('Image generation request failed. Please check server connectivity.');
    } finally {
      setIsImageGenerating(false);
    }
  };

  // 5. Music Generation using Lyria
  const handleGenerateMusic = async () => {
    if (!musicPrompt || isMusicGenerating) return;
    setIsMusicGenerating(true);
    setMusicResult(null);
    setStudioError(null);

    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          modelType: musicModelType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMusicResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStudioError(errData.error || `Music generation returned HTTP ${res.status}.`);
      }
    } catch (e) {
      console.warn('Music generator notice:', e);
      setStudioError('Music generation request failed. Please check server connectivity.');
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Procedural Web Audio Synth Player with deterministic stop/teardown
  const stopProceduralSynth = () => {
    if (synthAudioRef.current) {
      if (synthAudioRef.current.timer) clearTimeout(synthAudioRef.current.timer);
      synthAudioRef.current.oscs.forEach((o) => {
        try { o.stop(); } catch {}
      });
      synthAudioRef.current.ctx.close?.().catch(() => {});
      synthAudioRef.current = null;
    }
    setIsSynthPlaying(false);
  };

  const toggleProceduralSynth = () => {
    if (isSynthPlaying) {
      stopProceduralSynth();
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, ctx.currentTime); // A3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      const timer = setTimeout(() => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          setTimeout(() => stopProceduralSynth(), 1300);
        } catch {
          stopProceduralSynth();
        }
      }, 5000);

      synthAudioRef.current = { ctx, oscs: [osc1, osc2], timer };
      setIsSynthPlaying(true);
    } catch (e) {
      console.warn('Synth player notice:', e);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Cloud SQL / Firebase Status Bar */}
      <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] bg-gradient-to-r from-sky-950/30 via-slate-900/60 to-purple-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                COSMIC AI MULTI-MODAL STUDIO
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
              Harness Gemini 4 Argon, Gemini 4 Hydrogen, Omni Video, Nano Banana, Lyria Music, and Cloud SQL PostgreSQL.
            </p>
          </div>

          {/* Cloud SQL & Auth Status Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Honest Cloud SQL Status */}
            <div className={`px-3 py-1.5 rounded-xl bg-slate-900/80 border flex items-center gap-2 ${
              dbStatus?.connected ? 'border-cyan-500/30' : 'border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">
                {dbStatus?.connected ? 'Cloud SQL Connected' : 'Cloud SQL Degraded (Local Cache)'}
              </span>
            </div>

            {/* Firebase Auth Button */}
            {firebaseUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span>{firebaseUser.email?.slice(0, 16)}...</span>
                <button
                  onClick={handleSignOutGoogle}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignInGoogle}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 transition-all"
              >
                <span>Sign In (Firebase)</span>
              </button>
            )}

            {/* 3D Runner Game Quick Link */}
            <button
              onClick={() => setActiveView('cosmic-game')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold hover:scale-105 active:scale-95 transition-all"
            >
              Play 3D Space Game
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Neural Dialogue</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'voice'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice & Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'video'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Lab (Omni)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'image'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Visual Genesis (Nano)</span>
          </button>

          <button
            onClick={() => setActiveTab('music')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'music'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Sonic Lyria</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'database'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Cloud SQL Engine</span>
          </button>
        </div>
      </div>

      {/* Explicit Studio Error Banner */}
      {studioError && (
        <div role="alert" className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{studioError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStudioError(null)}
            className="text-rose-300 hover:text-white text-xs font-mono underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: NEURAL DIALOGUE (CHATBOT + SEARCH & MAPS GROUNDING) */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Model Selector */}
            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                Reasoning Model
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'gemini-4-hydrogen', name: 'Gemini 4 Hydrogen', tag: 'RECOMMENDED' },
                  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', tag: 'DEEP THINK' },
                  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Lite', tag: 'ULTRA FAST' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id as any)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between ${
                      selectedModel === m.id
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300">
                      {m.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Role Switcher */}
            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                Agent Persona
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'cosmic-publisher', label: 'Cosmic Publisher' },
                  { id: 'architecture-reviewer', label: 'Systems Architect' },
                  { id: 'storyteller', label: 'Sci-Fi Storyteller' },
                  { id: 'editorial-critic', label: 'Editorial Critic' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id as any)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-mono transition-all ${
                      selectedRole === r.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grounding Tools Toggles */}
            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                Grounding Engines
              </label>

              {/* Google Search */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-secondary)] cursor-pointer">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Google Search</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => {
                    setEnableSearch(e.target.checked);
                    if (e.target.checked) setEnableMaps(false); // Mutually exclusive per docs
                  }}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
                />
              </label>

              {/* Google Maps */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-secondary)] cursor-pointer">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Google Maps</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableMaps}
                  onChange={(e) => {
                    setEnableMaps(e.target.checked);
                    if (e.target.checked) setEnableSearch(false); // Mutually exclusive per docs
                  }}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
              </label>

              {enableMaps && userCoords && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300">
                  Geo-anchored: {userCoords.latitude.toFixed(2)}°, {userCoords.longitude.toFixed(2)}°
                </div>
              )}
            </div>

            {/* Saved Chat Sessions in Cloud SQL */}
            {savedSessions.length > 0 && (
              <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    Cloud SQL Sessions
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">{savedSessions.length}</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {savedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[11px] font-mono text-slate-300 truncate"
                    >
                      {session.title || 'Untitled turn'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Feed & Input */}
          <div className="lg:col-span-3 flex flex-col h-[580px] rounded-3xl glass-panel border border-[var(--border-color)] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono opacity-70">
                      <span>{msg.role === 'user' ? 'You' : `NOVA (${msg.modelUsed || selectedModel})`}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Grounding Chunks: Web URLs & Maps Places */}
                    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5 font-mono text-xs">
                        <span className="text-[10px] text-sky-400 uppercase tracking-wider block">
                          Grounding Citations & Sources:
                        </span>
                        {msg.groundingChunks.map((chunk, i) => {
                          if (chunk.web) {
                            return (
                              <a
                                key={i}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-[11px] mr-2 mb-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{chunk.web.title || chunk.web.uri}</span>
                              </a>
                            );
                          }
                          if (chunk.maps) {
                            return (
                              <a
                                key={i}
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px] mr-2 mb-1"
                              >
                                <MapPin className="w-3 h-3" />
                                <span>{chunk.maps.title || 'View Place on Google Maps'}</span>
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400 p-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing response via {selectedModel}...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask ${selectedRole} using ${selectedModel}...`}
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: VOICE & AUDIO (MIC TRANSCRIPTION WITH GEMINI-3.5-TRANSCRIBE) */}
      {activeTab === 'voice' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl glass-panel border border-[var(--border-color)] text-center space-y-6">
            <div>
              <div className="inline-flex p-4 rounded-3xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-3">
                <Mic className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                VOICE TRANSCRIPTION STUDIO
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono max-w-md mx-auto mt-1">
                Record your voice ideas or dictations; gemini-3.5-transcribe converts them into structured publication prose.
              </p>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="w-full h-24 rounded-2xl bg-slate-950 border border-[var(--border-color)] overflow-hidden flex items-center justify-center p-2">
              <canvas
                ref={voiceCanvasRef}
                width={500}
                height={80}
                className="w-full h-full"
              />
            </div>

            {/* Record / Stop Button */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-mono font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Live Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3.5 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-mono font-bold text-sm flex items-center gap-2 animate-pulse shadow-lg shadow-red-500/25 active:scale-95 transition-all"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Stop & Transcribe</span>
                </button>
              )}
            </div>

            {isTranscribing && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-sky-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing audio via gemini-3.5-transcribe...</span>
              </div>
            )}
          </div>

          {/* Transcribed Output Box */}
          {transcribedText && (
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  TRANSCRIPTION COMPLETED
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(transcribedText, 'transcription')}
                    className="p-1.5 rounded-lg bg-[var(--bg-secondary)] text-slate-300 hover:text-white"
                    title="Copy Text"
                  >
                    {copiedId === 'transcription' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      addPost({
                        title: 'Transcribed Audio Publication',
                        content: transcribedText,
                        category: 'Audio Memo',
                      });
                      setActiveView('feed');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono"
                  >
                    Publish to Feed
                  </button>
                </div>
              </div>
              <p className="p-4 rounded-xl bg-slate-950/60 font-sans text-sm text-slate-200 leading-relaxed border border-slate-800">
                {transcribedText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VIDEO LAB (GEMINI OMNI FLASH 1.2) */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Parameters & Controls */}
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-5">
            <div>
              <div className="inline-flex p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-2">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">
                VIDEO GENESIS (GEMINI OMNI FLASH)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Generate high-definition cinematic video sequences (16:9 or 9:16) with gemini-omni-1.2-flash.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[var(--text-muted)] block">
                Visual Motion Prompt
              </label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={4}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            {/* Aspect Ratio & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-[var(--text-muted)] block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`py-2 text-xs font-mono rounded-xl border ${
                      videoAspectRatio === '16:9'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    16:9 (Landscape)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`py-2 text-xs font-mono rounded-xl border ${
                      videoAspectRatio === '9:16'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    9:16 (Portrait)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[var(--text-muted)] block mb-1.5">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoDuration('5s')}
                    className={`py-2 text-xs font-mono rounded-xl border ${
                      videoDuration === '5s'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    5 Seconds
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoDuration('10s')}
                    className={`py-2 text-xs font-mono rounded-xl border ${
                      videoDuration === '10s'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    10 Seconds
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isVideoGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold text-xs sm:text-sm tracking-wider shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isVideoGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video Frames...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Synthesize Video with Omni Flash</span>
                </>
              )}
            </button>
          </div>

          {/* Video Preview Canvas */}
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[380px]">
            {generatedVideoUrl ? (
              <div className="w-full space-y-3">
                <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                  <span>Model: gemini-omni-1.2-flash</span>
                  <span>{videoAspectRatio} • {videoDuration}</span>
                </div>
              </div>
            ) : isVideoGenerating ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" />
                <p className="text-xs font-mono text-purple-300">
                  Interactions API rendering video clip...
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2 text-[var(--text-muted)] font-mono text-xs">
                <Video className="w-12 h-12 mx-auto stroke-1" />
                <p>Generated video stream will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: VISUAL GENESIS (GEMINI NANO BANANA 2.1) */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-5">
            <div>
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">
                HIGH-RESOLUTION IMAGE CREATION (NANO BANANA 2.1)
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Generate 1K visual assets with precise aspect ratios and creative depth.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[var(--text-muted)] block">
                Visual Art Prompt
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[var(--text-muted)] block mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setImageAspectRatio(ratio)}
                    className={`py-2 text-xs font-mono rounded-xl border ${
                      imageAspectRatio === ratio
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isImageGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isImageGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Image...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Generate Image with Nano Banana 2.1</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[380px]">
            {generatedImageUrl ? (
              <div className="w-full space-y-3">
                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-black max-h-[360px] flex items-center justify-center">
                  <img
                    src={generatedImageUrl}
                    alt={imagePrompt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                  <span>Model: gemini-nano-banana-2.1</span>
                  <button
                    onClick={() => {
                      addPost({
                        title: imagePrompt.slice(0, 40),
                        content: `Cosmic visual exploration generated with Gemini Nano Banana 2.1.\n\nPrompt: "${imagePrompt}"`,
                        coverImage: generatedImageUrl,
                      });
                      setActiveView('feed');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  >
                    Set as Post Cover
                  </button>
                </div>
              </div>
            ) : isImageGenerating ? (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <p className="text-xs font-mono text-emerald-300">
                  Rendering high-resolution visual...
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2 text-[var(--text-muted)] font-mono text-xs">
                <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                <p>Generated image canvas will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SONIC LYRIA (MUSIC STUDIO) */}
      {activeTab === 'music' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-color)] space-y-6">
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <Music className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                SONIC LYRIA MUSIC STUDIO
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                Compose original cosmic audio tracks and ambient soundtracks using lyria-3-clip-preview (30s) and lyria-3-pro-preview.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-[var(--text-muted)] block">
                Musical Composition Prompt
              </label>
              <input
                type="text"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMusicModelType('clip')}
                className={`p-3 rounded-xl text-left border font-mono text-xs ${
                  musicModelType === 'clip'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                <div>Lyria Clip (30s)</div>
                <div className="text-[10px] text-slate-400">lyria-3-clip-preview</div>
              </button>

              <button
                type="button"
                onClick={() => setMusicModelType('full')}
                className={`p-3 rounded-xl text-left border font-mono text-xs ${
                  musicModelType === 'full'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                <div>Lyria Pro (Full Track)</div>
                <div className="text-[10px] text-slate-400">lyria-3-pro-preview</div>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateMusic}
                disabled={isMusicGenerating}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-mono font-bold text-xs sm:text-sm tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isMusicGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Track...</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span>Compose with Lyria</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleProceduralSynth}
                className="px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center justify-center gap-2"
              >
                {isSynthPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSynthPlaying ? 'Mute Synth' : 'Live Synth Sample'}</span>
              </button>
            </div>

            {musicResult && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-3 font-mono text-xs">
                {musicResult.audioUrl && (
                  <audio src={musicResult.audioUrl} controls className="w-full" />
                )}
                {musicResult.lyrics && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 whitespace-pre-line text-xs font-sans">
                    {musicResult.lyrics}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CLOUD SQL POSTGRESQL ENGINE */}
      {activeTab === 'database' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
                  <Database className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">
                  CLOUD SQL (POSTGRESQL) TOPOLOGY
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                  Managed relational PostgreSQL instance synchronized with Firebase Authentication.
                </p>
              </div>

              <button
                onClick={fetchDbStatus}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${isDbLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">INSTANCE IDENTIFIER</span>
                <span className="text-cyan-400 text-sm font-bold">ai-studio-6cc40781</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CLOUD REGION</span>
                <span className="text-purple-400 text-sm font-bold">asia-south1</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ENGINE SPECIFICATION</span>
                <span className="text-emerald-400 text-sm font-bold">PostgreSQL 15</span>
              </div>
            </div>

            {/* Live Schema Tables View */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block">
                Provisioned Drizzle ORM Tables:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-1">users</span>
                  <p className="text-[11px] text-slate-400">
                    Stores Firebase Auth UIDs, user emails, handles, and role levels.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-1">posts</span>
                  <p className="text-[11px] text-slate-400">
                    Article content, reading times, slug indices, and like metrics.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">read_later</span>
                  <p className="text-[11px] text-slate-400">
                    Relational collection bookmarks for offline access caching.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">gemini_chats</span>
                  <p className="text-[11px] text-slate-400">
                    Multi-turn conversational history with grounding citations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
