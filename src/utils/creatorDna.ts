import { Post, CreatorDNA, CreatorTwinPersona } from '../types';

/**
 * Calculates Creator DNA metrics from user's posts:
 * - Consistency Score (frequency and regularity of publication)
 * - Vocabulary Richness (unique words / total words)
 * - Dominant Topics
 * - Style Radar (analytical, storytelling, conciseness, technicalDepth, engagement)
 */
export function calculateCreatorDNA(userId: string, posts: Post[]): CreatorDNA {
  const userPosts = posts.filter((p) => p.authorId === userId);

  if (userPosts.length === 0) {
    return {
      userId,
      consistencyScore: 50,
      vocabularyRichness: 60,
      dominantTopics: [
        { topic: 'Artificial Intelligence', percentage: 40 },
        { topic: 'System Architecture', percentage: 35 },
        { topic: 'Design Systems', percentage: 25 },
      ],
      styleRadar: {
        analytical: 80,
        storytelling: 65,
        conciseness: 75,
        technicalDepth: 85,
        engagement: 70,
      },
      summary: 'Emerging tech architect with high technical depth and balanced analytical focus.',
    };
  }

  // Topic distribution
  const topicCounts: Record<string, number> = {};
  let totalWords = 0;
  const uniqueWords = new Set<string>();

  userPosts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });

    const tokens = post.content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    totalWords += tokens.length;
    tokens.forEach((t) => uniqueWords.add(t));
  });

  const totalTags = Object.values(topicCounts).reduce((a, b) => a + b, 0) || 1;
  const dominantTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([topic, count]) => ({
      topic,
      percentage: Math.round((count / totalTags) * 100),
    }));

  const vocabularyRichness = totalWords > 0
    ? Math.min(100, Math.round((uniqueWords.size / Math.min(totalWords, 2000)) * 100))
    : 70;

  // Consistency score calculation
  const consistencyScore = Math.min(100, Math.max(30, userPosts.length * 20));

  // Determine style radar
  const codeBlocksCount = userPosts.reduce((acc, p) => acc + (p.content.match(/```/g)?.length || 0), 0);
  const questionsCount = userPosts.reduce((acc, p) => acc + (p.content.match(/\?/g)?.length || 0), 0);

  const technicalDepth = Math.min(95, 60 + codeBlocksCount * 6);
  const engagement = Math.min(95, 65 + questionsCount * 3 + userPosts.length * 4);
  const analytical = Math.min(95, 70 + userPosts.length * 5);
  const storytelling = Math.min(90, 60 + Math.floor(totalWords / 200));
  const conciseness = Math.max(50, 90 - Math.floor(totalWords / 400));

  return {
    userId,
    consistencyScore,
    vocabularyRichness,
    dominantTopics: dominantTopics.length > 0 ? dominantTopics : [{ topic: 'Technology', percentage: 100 }],
    styleRadar: {
      analytical,
      storytelling,
      conciseness,
      technicalDepth,
      engagement,
    },
    summary: `Active creator specializing in ${dominantTopics[0]?.topic || 'Technology'} with strong ${
      technicalDepth > 80 ? 'technical depth' : 'community engagement'
    } and high analytical rigor.`,
  };
}

/**
 * Synthesizes sample prose calibrated to the Creator Twin configuration,
 * reflecting tone, technical depth, conciseness, signature phrases, and filtering banned cliches.
 */
export function synthesizeCreatorTwinSample(config: CreatorTwinPersona, topic: string): string {
  const cleanTopic = topic.trim() || 'Distributed Agent Orchestration';
  const signature = config.signaturePhrases?.[0]?.trim() || 'architectural first principles';

  const openers: Record<CreatorTwinPersona['tone'], string> = {
    analytical: `Examining ${cleanTopic} through measurable system invariants clarifies where bottlenecks originate.`,
    visionary: `${cleanTopic} marks an inflection point for how creative minds orchestrate autonomous infrastructure.`,
    conversational: `Let's unpack ${cleanTopic}—not in abstract buzzwords, but in how it actually feels in daily practice.`,
    academic: `A formal investigation of ${cleanTopic} demonstrates structural trade-offs between coordination overhead and throughput.`,
  };

  const technicalDetail =
    config.technicalDepthLevel >= 70
      ? `At the protocol layer, deterministic state machines bound retry latency while typed schema contracts prevent silent drift.`
      : `Focusing on clear workflows keeps teams aligned without drowning readers in low-level implementation minutiae.`;

  const creativeFlourish =
    config.creativityLevel >= 70
      ? `Think of the feedback loop as an acoustic chamber: every signal refines the resonance of the next iteration.`
      : `Each step maps directly to a verifiable outcome and clear handoff boundary.`;

  const voiceLine = config.activeVoicePreference
    ? `We ground the roadmap in ${signature} so every release ships with confidence.`
    : `The roadmap is grounded in ${signature} so releases can be verified systematically.`;

  const parts =
    config.concisenessLevel >= 75
      ? [openers[config.tone], technicalDetail, voiceLine]
      : [openers[config.tone], technicalDetail, creativeFlourish, voiceLine];

  let draft = parts.join(' ');
  if (config.customDirective?.trim()) {
    draft += ` [Directive applied: ${config.customDirective.trim()}]`;
  }

  for (const cliche of config.bannedCliches || []) {
    const trimmed = cliche.trim();
    if (!trimmed) continue;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    draft = draft.replace(new RegExp(escaped, 'gi'), 'essential');
  }

  return draft.replace(/\s{2,}/g, ' ').trim();
}

