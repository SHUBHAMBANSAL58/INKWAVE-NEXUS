import { TaskPriority } from '../types';
import { analyzeTaskSentiment } from './taskClustering.ts';

export type TaskSentimentMood = 'calm' | 'focused' | 'complex' | 'urgent';

const VALID_MOODS: TaskSentimentMood[] = ['calm', 'focused', 'complex', 'urgent'];

/**
 * Validates that a user-provided image or media URL uses a safe protocol.
 * Rejects javascript:, vbscript:, data:text/html, or malformed values.
 */
export function sanitizeMediaUrl(
  rawUrl: unknown,
  fallbackUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
): string {
  if (typeof rawUrl !== 'string') return fallbackUrl;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2000000) return fallbackUrl;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('https://') || lower.startsWith('http://')) {
    return trimmed;
  }
  if (lower.startsWith('data:image/png;base64,') || lower.startsWith('data:image/jpeg;base64,') || lower.startsWith('data:image/webp;base64,')) {
    return trimmed;
  }
  return fallbackUrl;
}

/**
 * Normalizes AI-returned or client-supplied mood tags into the strict 4-mood taxonomy.
 */
export function normalizeSentimentMood(
  rawMood: unknown,
  title: string,
  prompt: string,
  priority: TaskPriority = 'medium'
): TaskSentimentMood {
  if (typeof rawMood === 'string') {
    const clean = rawMood.trim().toLowerCase() as TaskSentimentMood;
    if (VALID_MOODS.includes(clean)) {
      return clean;
    }
  }
  return analyzeTaskSentiment(title, prompt, priority);
}

/**
 * Lightweight in-memory sliding-window rate limiter keyed by client/IP + route bucket.
 */
export class SlidingWindowRateLimiter {
  private hits = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 40, windowMs = 60_000) {
    this.maxRequests = Math.max(1, maxRequests);
    this.windowMs = Math.max(1000, windowMs);
  }

  check(key: string, now = Date.now()): {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
    limit: number;
  } {
    const windowStart = now - this.windowMs;
    const prev = this.hits.get(key) || [];
    const active = prev.filter((ts) => ts > windowStart);

    if (active.length >= this.maxRequests) {
      const oldest = active[0] ?? now;
      const retryAfterMs = Math.max(1000, oldest + this.windowMs - now);
      this.hits.set(key, active);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        limit: this.maxRequests,
      };
    }

    active.push(now);
    this.hits.set(key, active);

    // Opportunistic cleanup to prevent unbounded key growth
    if (this.hits.size > 500) {
      for (const [entryKey, timestamps] of this.hits.entries()) {
        if (timestamps.every((ts) => ts <= windowStart)) {
          this.hits.delete(entryKey);
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - active.length),
      retryAfterSeconds: 0,
      limit: this.maxRequests,
    };
  }
}

export const SECURITY_RESPONSE_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self)',
};
