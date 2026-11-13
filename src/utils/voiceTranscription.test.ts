import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseVoiceTaskMemo } from './voiceTranscription';

describe('VoiceTranscription Parser', () => {
  it('parses explicit Title and Objective labels correctly', () => {
    const speech = 'Title: Real-Time Vector Memory Cache. Objective: Build a high-throughput in-memory LRU vector cache for multi-agent handoffs.';
    const parsed = parseVoiceTaskMemo(speech);
    assert.strictEqual(parsed.title, 'Real-Time Vector Memory Cache');
    assert.strictEqual(parsed.prompt, 'Build a high-throughput in-memory LRU vector cache for multi-agent handoffs.');
  });

  it('parses sentence-based speech into title and detailed prompt', () => {
    const speech = 'Implement cosmic voice navigation shortcuts. Users should be able to toggle the recording engine using voice commands or the microphone button.';
    const parsed = parseVoiceTaskMemo(speech);
    assert.strictEqual(parsed.title, 'Implement cosmic voice navigation shortcuts');
    assert.strictEqual(parsed.prompt, 'Users should be able to toggle the recording engine using voice commands or the microphone button.');
  });

  it('handles short utterances gracefully', () => {
    const speech = 'Optimize database queries';
    const parsed = parseVoiceTaskMemo(speech);
    assert.strictEqual(parsed.title, 'Optimize database queries');
    assert.strictEqual(parsed.prompt, 'Optimize database queries');
  });

  it('handles empty or whitespace strings', () => {
    const parsed = parseVoiceTaskMemo('   ');
    assert.strictEqual(parsed.title, '');
    assert.strictEqual(parsed.prompt, '');
  });
});
