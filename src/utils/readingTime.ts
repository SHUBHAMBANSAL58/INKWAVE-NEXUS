import { TableOfContentItem } from '../types';

/**
 * Calculates estimated reading time and word count for an article.
 * Standard adult reading speed is ~200-220 words per minute.
 */
export function calculateReadingTime(text: string): { words: number; minutes: number } {
  if (!text || typeof text !== 'string') {
    return { words: 0, minutes: 1 };
  }

  // Remove markdown symbols and extra whitespace
  const cleanText = text
    .replace(/[#*`~_>[\]()\-]/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return { words, minutes };
}

/**
 * Parses markdown headings (# Heading, ## Subheading, ### Section)
 * into a structured Table of Contents.
 */
export function extractTableOfContents(markdown: string): TableOfContentItem[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const items: TableOfContentItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      items.push({ id, text, level });
    }
  }

  return items;
}
