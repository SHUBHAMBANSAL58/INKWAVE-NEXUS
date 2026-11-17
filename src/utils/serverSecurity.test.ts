import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeMediaUrl,
  normalizeSentimentMood,
  SlidingWindowRateLimiter,
  SECURITY_RESPONSE_HEADERS,
} from './serverSecurity.ts';

test('sanitizeMediaUrl allows safe https/http and data:image URLs and rejects javascript:', () => {
  const safeHttps = sanitizeMediaUrl('https://images.unsplash.com/photo-123');
  assert.equal(safeHttps, 'https://images.unsplash.com/photo-123');

  const safeDataPng = sanitizeMediaUrl('data:image/png;base64,iVBORw0KGgo=');
  assert.equal(safeDataPng, 'data:image/png;base64,iVBORw0KGgo=');

  const fallback = 'https://fallback.example/default.png';
  assert.equal(sanitizeMediaUrl('javascript:alert(1)', fallback), fallback);
  assert.equal(sanitizeMediaUrl('data:text/html,<script>alert(1)</script>', fallback), fallback);
  assert.equal(sanitizeMediaUrl('', fallback), fallback);
});

test('normalizeSentimentMood validates allowed moods and falls back deterministically', () => {
  assert.equal(normalizeSentimentMood('COMPLEX', 'Task', 'Body'), 'complex');
  assert.equal(
    normalizeSentimentMood('invalid-mood', 'Urgent security patch', 'Fix immediately', 'high'),
    'urgent'
  );
  assert.equal(
    normalizeSentimentMood(undefined, 'Benchmark distributed cache', 'Deep-dive algorithm check', 'medium'),
    'complex'
  );
});

test('SlidingWindowRateLimiter enforces per-key window limits and resets after expiry', () => {
  const limiter = new SlidingWindowRateLimiter(3, 10_000);
  const t0 = 1_000_000;

  assert.equal(limiter.check('ip:1', t0).allowed, true);
  assert.equal(limiter.check('ip:1', t0 + 100).allowed, true);
  assert.equal(limiter.check('ip:1', t0 + 200).remaining, 0);

  const blocked = limiter.check('ip:1', t0 + 300);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);

  // Separate client key remains allowed
  assert.equal(limiter.check('ip:2', t0 + 300).allowed, true);

  // Original key resets once window expires
  assert.equal(limiter.check('ip:1', t0 + 10_500).allowed, true);
});

test('SECURITY_RESPONSE_HEADERS includes baseline hardening headers', () => {
  assert.equal(SECURITY_RESPONSE_HEADERS['X-Content-Type-Options'], 'nosniff');
  assert.equal(SECURITY_RESPONSE_HEADERS['Referrer-Policy'], 'strict-origin-when-cross-origin');
});
