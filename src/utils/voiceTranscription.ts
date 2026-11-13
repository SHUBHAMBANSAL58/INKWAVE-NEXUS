/**
 * Utility for parsing voice-recorded task memos and handling audio transcription.
 */

export interface ParsedVoiceTask {
  title: string;
  prompt: string;
}

/**
 * Parses spoken task descriptions into title and prompt fields.
 * Handles natural speech conventions, prefixes (e.g., "Title:", "Objective:"),
 * or falls back to first sentence as title and remaining as description.
 */
export function parseVoiceTaskMemo(transcript: string): ParsedVoiceTask {
  if (!transcript || !transcript.trim()) {
    return { title: '', prompt: '' };
  }

  const cleaned = transcript.trim();

  // Pattern 1: Explicit "Title: ... Description: / Objective: ..."
  const explicitPattern = /(?:title\s*[:\-]\s*)(.*?)(?:\s+(?:objective|description|details|prompt)\s*[:\-]\s*)(.*)/i;
  const explicitMatch = cleaned.match(explicitPattern);
  if (explicitMatch && explicitMatch[1] && explicitMatch[2]) {
    return {
      title: cleanTitle(explicitMatch[1]),
      prompt: cleanPrompt(explicitMatch[2]),
    };
  }

  // Pattern 2: "Objective: ... " or "Task: ... "
  const taskPrefixPattern = /^(?:task|create|build|implement)\s*[:\-]\s*(.*)/i;
  const taskPrefixMatch = cleaned.match(taskPrefixPattern);
  const textToSplit = taskPrefixMatch ? taskPrefixMatch[1] : cleaned;

  // Split on first sentence terminator (. ! ? or newline)
  const sentenceEndIndex = textToSplit.search(/[\.\!\?\n]/);

  if (sentenceEndIndex !== -1 && sentenceEndIndex < 100) {
    const rawTitle = textToSplit.slice(0, sentenceEndIndex).trim();
    const rawPrompt = textToSplit.slice(sentenceEndIndex + 1).trim();

    if (rawTitle.length > 0 && rawPrompt.length > 0) {
      return {
        title: cleanTitle(rawTitle),
        prompt: cleanPrompt(rawPrompt),
      };
    }
  }

  // If short (<= 60 chars), use as title
  if (cleaned.length <= 60) {
    return {
      title: cleanTitle(cleaned),
      prompt: cleanPrompt(cleaned),
    };
  }

  // Otherwise, split at roughly 50-60 characters at a word boundary
  const words = cleaned.split(/\s+/);
  let titleWords: string[] = [];
  let promptWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const currentLength = titleWords.join(' ').length;
    if (currentLength + words[i].length < 50 || titleWords.length < 3) {
      titleWords.push(words[i]);
    } else {
      promptWords = words.slice(i);
      break;
    }
  }

  return {
    title: cleanTitle(titleWords.join(' ')),
    prompt: cleanPrompt(promptWords.length > 0 ? promptWords.join(' ') : cleaned),
  };
}

function cleanTitle(str: string): string {
  return str
    .replace(/^[\s\.\,\:\-]+/, '')
    .replace(/[\s\.\,\:\-]+$/, '')
    .trim();
}

function cleanPrompt(str: string): string {
  return str
    .replace(/^[\s\,\:\-]+/, '')
    .replace(/[\s\,\:\-]+$/, '')
    .trim();
}

/**
 * Converts a recorded Audio Blob into Base64 format.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Strip metadata prefix e.g. "data:audio/webm;base64,"
      const base64Content = base64data.split(',')[1] || base64data;
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
