import React, { useState, useEffect } from 'react';
import { AgentTask } from '../../types';
import {
  X,
  Share2,
  Users,
  UserPlus,
  Mail,
  Shield,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Send,
  MessageSquare,
  Sparkles,
  Database,
  Wifi,
} from 'lucide-react';
import {
  ensureContactsSeeded,
  shareTaskWithContact,
  subscribeToTaskShares,
  revokeTaskShare,
  FirestoreContact,
  FirestoreTaskShare,
} from '../../services/firestoreSync';
import { auth } from '../../lib/firebase';

interface ShareTaskModalProps {
  task: AgentTask;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareTaskModal({ task, isOpen, onClose }: ShareTaskModalProps) {
  const [contacts, setContacts] = useState<FirestoreContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<FirestoreContact | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [role, setRole] = useState<'collaborator' | 'reviewer' | 'observer'>('collaborator');
  const [activeShares, setActiveShares] = useState<FirestoreTaskShare[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteSavedNotice, setInviteSavedNotice] = useState<string | null>(null);
  const [copiedInviteCard, setCopiedInviteCard] = useState(false);

  const currentUserId = auth.currentUser?.uid || 'creator-alex';

  // Load contacts and subscribe to task shares
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    ensureContactsSeeded(currentUserId).then((list) => {
      if (isMounted) setContacts(list);
    });

    const unsubscribe = subscribeToTaskShares(task.id, (shares) => {
      if (isMounted) setActiveShares(shares);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, task.id, currentUserId]);

  if (!isOpen) return null;

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();

    const inviteeEmail = selectedContact ? selectedContact.email : customEmail.trim();
    const inviteeName = selectedContact ? selectedContact.name : customName.trim() || inviteeEmail.split('@')[0];

    if (!inviteeEmail) return;

    setIsSubmitting(true);
    try {
      await shareTaskWithContact({
        taskId: task.id,
        taskTitle: task.title,
        ownerId: currentUserId,
        inviteeEmail,
        inviteeName,
        role,
      });

      setInviteSavedNotice(`Invitation saved in Firestore for ${inviteeName} (${role}). Share the direct task link below.`);
      setTimeout(() => setInviteSavedNotice(null), 5000);

      // Reset form fields
      setSelectedContact(null);
      setCustomEmail('');
      setCustomName('');
    } catch (err) {
      console.warn('Task share notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeTaskShare(shareId);
    } catch (e) {
      console.warn('Revoke share notice:', e);
    }
  };

  const shareableUrl = `${window.location.origin}/#nexus-task-${task.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[var(--border-color)] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                Task Collaboration Portal
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Share Task: "{task.title}"
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
              Task ID: {task.id} • Active Agent: {task.activeAgent.toUpperCase()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 p-5 overflow-y-auto space-y-4">
          {/* Firestore Persistence Status Capsule */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Firestore Persistence Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <Wifi className="w-3.5 h-3.5" />
              <span>Offline-first cache & auto-sync</span>
            </div>
          </div>

          {/* Form: Invite from Contacts or Enter Custom Invitee */}
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Select Contact to Invite:
              </label>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {contacts.map((contact) => {
                  const isSelected = selectedContact?.id === contact.id;
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        setSelectedContact(isSelected ? null : contact);
                        setCustomEmail('');
                        setCustomName('');
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/60 shadow-sm text-purple-200'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-slate-600'
                      }`}
                    >
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{contact.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                          {contact.email}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Email Input if not in contacts */}
            {!selectedContact && (
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] space-y-2">
                <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" /> Or invite custom email address:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="colleague@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name (optional)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Role / Permission Selection */}
            <div>
              <label className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Collaboration Role & Permissions:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {[
                  { id: 'collaborator', title: 'Collaborator', desc: 'Can advance agents' },
                  { id: 'reviewer', title: 'Reviewer', desc: 'Can approve & reject' },
                  { id: 'observer', title: 'Observer', desc: 'Read-only view' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      role === r.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="font-bold">{r.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Copyable Invite Snippet Helper */}
            <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    Copy Workspace Invite Summary
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">
                    Copy formatted task card text to paste into Chat or Slack
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const summary = `NEXUS CORE Collaboration Invite — Task: "${task.title}" (${task.priority.toUpperCase()}) • Role: ${role.toUpperCase()} • ${shareableUrl}`;
                  navigator.clipboard?.writeText(summary);
                  setCopiedInviteCard(true);
                  setTimeout(() => setCopiedInviteCard(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 text-[11px] font-mono shrink-0"
              >
                {copiedInviteCard ? 'Copied!' : 'Copy Card'}
              </button>
            </div>

            {/* Submit Invite Button */}
            <button
              type="submit"
              disabled={(!selectedContact && !customEmail.trim()) || isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Invite...' : 'Save & Issue Task Invite'}</span>
            </button>
          </form>

          {/* Honest Firestore Invite Saved Banner */}
          {inviteSavedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{inviteSavedNotice}</span>
            </div>
          )}

          {/* Active Collaborators on this Task */}
          <div className="pt-2 border-t border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Invited Collaborators ({activeShares.length})
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                Synced via Firestore
              </span>
            </div>

            {activeShares.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] font-mono py-2 text-center bg-[var(--bg-secondary)]/30 rounded-xl">
                No external collaborators invited yet. Select a contact above to share this task.
              </p>
            ) : (
              <div className="space-y-2">
                {activeShares.map((share) => (
                  <div
                    key={share.id}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">
                        {share.inviteeName || share.inviteeEmail}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">
                        {share.inviteeEmail} • Role: {share.role.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {share.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleRevoke(share.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Revoke invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Copy Link Box */}
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="truncate text-slate-400 text-[11px] flex-1">
              {shareableUrl}
            </div>
            <button
              onClick={copyShareLink}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 flex items-center gap-1.5 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
