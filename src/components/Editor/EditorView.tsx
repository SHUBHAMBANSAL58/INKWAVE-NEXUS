import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateReadingTime } from '../../utils/readingTime';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Sparkles,
  Eye,
  Send,
  Image as ImageIcon,
  Tag,
  Clock,
  FileText,
  Wand2,
  List,
  Heading,
  Code,
  Quote,
  Shield,
  HelpCircle,
} from 'lucide-react';

export function EditorView() {
  const { addPost, setActiveView, setSelectedArticle } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
  );
  const [tagsInput, setTagsInput] = useState('Artificial Intelligence, Architecture, NEXUS CORE');
  const [category, setCategory] = useState('Engineering');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [isPreview, setIsPreview] = useState(false);

  // AI Creator Studio state
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { words, minutes } = calculateReadingTime(content);

  const handleInsertSnippet = (syntax: string) => {
    setContent((prev) => `${prev}\n\n${syntax}\n\n`);
  };

  const handleRunAiTool = async (tool: string) => {
    setActiveAiTool(tool);
    setAiGenerating(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          topic: title || 'Modern AI Orchestration Systems',
          context: content.slice(0, 300),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data.result);
      }
    } catch (err) {
      console.warn('AI Studio tool notice:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiResult = () => {
    if (!aiResult) return;
    if (activeAiTool === 'outline') {
      setContent((prev) => `${prev}\n\n${aiResult}`);
    } else if (activeAiTool === 'title') {
      const firstLine = aiResult.split('\n')[0].replace(/^\d+\.\s*/, '');
      setTitle(firstLine);
    } else if (activeAiTool === 'tone') {
      setContent(aiResult.replace('Refined Version:\n', ''));
    }
    setAiResult(null);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setValidationError('Please provide both an article title and content body before publishing.');
      return;
    }
    setValidationError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const published = await addPost({
      title,
      content,
      coverImage,
      tags: tags.length > 0 ? tags : ['Technology'],
      category,
      visibility,
    });

    try {
      confetti({ particleCount: 70, spread: 50 });
    } catch (e) {
      // ignore
    }

    setSelectedArticle(published);
    setActiveView('feed');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" /> Studio Editor
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Markdown & Rich Formatting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Authoring & Creator Studio</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isPreview
                ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isPreview ? 'Edit Mode' : 'Live Preview'}</span>
          </button>

          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" /> Publish Publication
          </button>
        </div>
      </div>

      {/* AI Creator Studio Assistant Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-violet-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase text-violet-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Creator Studio Intelligence
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">Powered by Gemini 4 Hydrogen</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleRunAiTool('outline')}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold"
          >
            <Wand2 className="w-3.5 h-3.5" /> Generate Outline
          </button>
          <button
            onClick={() => handleRunAiTool('title')}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold"
          >
            <Heading className="w-3.5 h-3.5" /> High-Impact Titles
          </button>
          <button
            onClick={() => handleRunAiTool('seo')}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> SEO Metadata
          </button>
          <button
            onClick={() => handleRunAiTool('tone')}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Enhance Tone
          </button>
        </div>

        {/* AI Result Box */}
        {aiGenerating && (
          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-violet-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 animate-spin text-violet-400" />
            Synthesizing creative recommendation...
          </div>
        )}

        {aiResult && !aiGenerating && (
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-violet-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-400">
              <span>Tool Output ({activeAiTool?.toUpperCase()})</span>
              <button
                onClick={handleApplyAiResult}
                className="px-2.5 py-1 rounded-lg bg-violet-500 hover:bg-violet-400 text-white font-semibold text-xs"
              >
                Insert into Article ↵
              </button>
            </div>
            <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap max-h-48 overflow-y-auto">
              {aiResult}
            </pre>
          </div>
        )}
      </div>

      {validationError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2"
        >
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-200 hover:text-white px-2 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Body */}
      {!isPreview ? (
        <div className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Publication Title (e.g. Distributed Consensus in Multi-Agent Topologies)"
            className="w-full px-5 py-3.5 text-xl sm:text-2xl font-extrabold rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
          />

          {/* Quick Markdown Inserts */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl glass-panel border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
            <span className="font-mono text-[11px] text-[var(--text-muted)] mr-1">Shortcuts:</span>
            <button
              onClick={() => handleInsertSnippet('## Section Heading')}
              className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-sky-500/10 hover:text-sky-300 border border-[var(--border-color)]"
            >
              H2 Heading
            </button>
            <button
              onClick={() => handleInsertSnippet('```ts\n// TypeScript snippet\nconst agent = new NexusAgent();\n```')}
              className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-sky-500/10 hover:text-sky-300 border border-[var(--border-color)]"
            >
              Code Block
            </button>
            <button
              onClick={() => handleInsertSnippet('> "Architectural excellence is achieved when every agent has explicit boundaries."')}
              className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-sky-500/10 hover:text-sky-300 border border-[var(--border-color)]"
            >
              Blockquote
            </button>
            <button
              onClick={() => handleInsertSnippet('- Bullet item 1\n- Bullet item 2\n- Bullet item 3')}
              className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-sky-500/10 hover:text-sky-300 border border-[var(--border-color)]"
            >
              Bulleted List
            </button>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationError) setValidationError(null);
            }}
            rows={15}
            placeholder="Write your long-form publication in clean markdown. Support headings, lists, code blocks, and diagrams..."
            className="w-full p-5 text-sm sm:text-base font-sans rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed focus:outline-none focus:border-sky-500"
          />

          {/* Word Count and Live Estimator Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-1">
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-sky-400" /> {words} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> ~{minutes} min read estimate
            </span>
          </div>

          {/* Publishing Metadata Accordion / Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="Engineering">Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Design">Design</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="public">Public (Entire Universe)</option>
                <option value="followers">Followers Only</option>
                <option value="private">Private Draft</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Live Article Preview */
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[var(--border-color)] space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">{category}</span>
            <span>•</span>
            <span>{minutes} min read ({words} words)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            {title || 'Untitled Article'}
          </h1>

          {coverImage && (
            <div className="rounded-2xl overflow-hidden max-h-80 border border-[var(--border-color)]">
              <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] space-y-4">
            {content ? (
              content.split('\n\n').map((b, i) => <p key={i}>{b}</p>)
            ) : (
              <p className="text-[var(--text-muted)] italic">No content written yet. Switch to Edit Mode to compose.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
