import {
  User,
  Post,
  Story,
  Community,
  AgentTask,
  Notification,
  KnowledgeGraphNode,
  NovaMemoryItem,
  DirectMessage,
} from './types';

export const CURRENT_USER: User = {
  id: 'user-nexus-1',
  name: 'Alex Vance',
  username: 'alexvance',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
  bio: 'AI Systems Architect & Digital Publisher. Exploring multi-agent orchestration, neural publishing networks, and interactive cyber-interfaces.',
  website: 'https://alexvance.nexus',
  socialLinks: {
    twitter: 'https://x.com/alexvance',
    github: 'https://github.com/alexvance',
    linkedin: 'https://linkedin.com/in/alexvance',
  },
  interests: ['Artificial Intelligence', 'Multi-Agent Systems', 'Distributed Computing', 'Design Systems', 'Quantum Web'],
  skills: ['TypeScript', 'Full-Stack Architecture', 'Agent Orchestration', 'Tailwind CSS', 'PostgreSQL'],
  followersCount: 14820,
  followingCount: 342,
  isVerified: true,
  role: 'admin',
  creatorBadges: ['Nexus Architect', 'Consistent Creator', 'Verified Author', 'Top Contributor'],
};

export const OTHER_USERS: User[] = [
  {
    id: 'user-elena-2',
    name: 'Elena Rostova',
    username: 'elenarostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    bio: 'Lead Designer at CyberFrame. Crafting hyper-functional glassmorphic UI systems and next-generation editorial aesthetics.',
    website: 'https://elena.design',
    socialLinks: { twitter: 'https://x.com/elenarostova' },
    interests: ['Design Systems', 'UI/UX', 'Micro-Interactions', 'Typography'],
    skills: ['Figma', 'CSS Architecture', 'Interaction Design'],
    followersCount: 9240,
    followingCount: 410,
    isVerified: true,
    role: 'moderator',
    creatorBadges: ['Design Vanguard', 'Consistent Creator'],
  },
  {
    id: 'user-marcus-3',
    name: 'Dr. Marcus Thorne',
    username: 'mthorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    bio: 'Autonomous Systems Researcher. Investigating agentic consensus, synthetic memory loops, and zero-trust compute topologies.',
    website: 'https://thorne-research.org',
    socialLinks: { github: 'https://github.com/mthorne' },
    interests: ['Multi-Agent Systems', 'Autonomous AI', 'Cryptography', 'Consensus Algorithms'],
    skills: ['Python', 'Distributed Consensus', 'LLM Fine-tuning'],
    followersCount: 22100,
    followingCount: 195,
    isVerified: true,
    role: 'user',
    creatorBadges: ['Technical Writer', 'Verified Author'],
  },
  {
    id: 'user-sophia-4',
    name: 'Sophia Chen',
    username: 'sophiacodes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    bio: 'Full Stack Engineer & OSS Maintainer. Writing deep-dives on high-throughput Node.js runtimes and Edge computing.',
    interests: ['Full Stack', 'Cloud Native', 'Node.js', 'PostgreSQL'],
    skills: ['TypeScript', 'Rust', 'Docker', 'PostgreSQL'],
    followersCount: 11400,
    followingCount: 520,
    isVerified: false,
    role: 'user',
    creatorBadges: ['Helpful Contributor'],
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: CURRENT_USER.id,
    author: CURRENT_USER,
    title: 'The Multi-Agent Symphony: Building NEXUS CORE Orchestration Architecture',
    slug: 'the-multi-agent-symphony-nexus-core',
    excerpt:
      'How specialized AI agents—Planner, Designer, Builder, and Tester—form an autonomous pipeline transforming natural language intent into production software.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    content: `# The Multi-Agent Symphony: Building NEXUS CORE

In traditional AI software engineering, single-agent architectures frequently falter when managing complex, multi-stage workflows. A single model tasked simultaneously with high-level architectural trade-offs, token-level UI styling, backend contract adherence, and rigorous verification inevitably experiences context fragmentation.

## The Paradigm Shift: Four Specialized Intelligences

NEXUS CORE solves this by decomposing engineering execution into four autonomous, strongly-typed agents:

1. **PLANNER (Strategic Brain)**: Formulates functional specifications, calculates dependencies, defines strict acceptance criteria, and constructs the execution roadmap.
2. **DESIGNER (Creative Intelligence)**: Establishes visual design tokens, typography scales, accessibility contrasts, and interaction mechanics.
3. **BUILDER (Engineering Intelligence)**: Executes the approved technical blueprint, synthesizes robust components, and satisfies API contracts.
4. **TESTER (Quality Guardian)**: Subject every implementation to rigorous boundary verification, unit assertions, and performance profiling.

\`\`\`ts
// NEXUS CORE Agent Handoff Contract
export interface AgentHandoffEnvelope {
  taskId: string;
  sourceAgent: AgentType;
  targetAgent: AgentType;
  payloadArtifact: unknown;
  acceptanceCriteria: string[];
  requiresHumanApproval: boolean;
}
\`\`\`

## Circuit Breakers and Human-in-the-Loop Governance

An essential rule of autonomous agent design is preventing hallucinated recursion loops. When the **TESTER** flags defect severity, execution bounces back to the **BUILDER** with actionable reproduction steps. If the failure threshold exceeds maximum bounds, a circuit breaker trips immediately, presenting full diagnostics to the human creator.

Autonomous orchestration isn't about replacing human agency—it is about elevating the creator from manual typist to conductor of an intelligent digital universe.`,
    tags: ['Artificial Intelligence', 'Multi-Agent Systems', 'Architecture', 'Engineering'],
    category: 'Engineering',
    readingTime: 4,
    wordCount: 780,
    publishedAt: '2026-11-08T14:30:00Z',
    updatedAt: '2026-11-08T14:30:00Z',
    visibility: 'public',
    likesCount: 384,
    commentsCount: 42,
    bookmarksCount: 128,
    viewsCount: 3200,
    isLiked: false,
    isBookmarked: true,
    tableOfContents: [
      { id: 'the-multi-agent-symphony-building-nexus-core', text: 'The Multi-Agent Symphony: Building NEXUS CORE', level: 1 },
      { id: 'the-paradigm-shift-four-specialized-intelligences', text: 'The Paradigm Shift: Four Specialized Intelligences', level: 2 },
      { id: 'circuit-breakers-and-human-in-the-loop-governance', text: 'Circuit Breakers and Human-in-the-Loop Governance', level: 2 },
    ],
    communityId: 'comm-ai-ml',
  },
  {
    id: 'post-2',
    authorId: 'user-elena-2',
    author: OTHER_USERS[0],
    title: 'Midnight Cyan & Electric Glass: The Next Wave of Publishing Interfaces',
    slug: 'midnight-cyan-electric-glass-publishing-interfaces',
    excerpt:
      'Deconstructing modern glassmorphism, high-contrast typography, and atmospheric lighting in digital publications without sacrificing WCAG AA accessibility.',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    content: `# Midnight Cyan & Electric Glass: The Next Wave of Publishing Interfaces

Digital publications often swing between two extremes: sterile document readers with black text on plain white canvases, or cluttered neon dashboards that fatigue reader vision within three minutes.

## The Philosophy of Ambient Contrast

Atmospheric design begins with the background depth. By layering 12% translucent dark navy panels with subtle cyan-to-violet borders over deep midnight backdrops (\`#0a0e17\`), we create dimensional depth without cognitive overload.

## Typography Hierarchy in Long-Form Tech Journalism

- **Display Headers**: Space Grotesk / Plus Jakarta Sans at -0.02em tracking for confident authority.
- **Editorial Body**: High-legibility sans-serif with 1.7 line height for effortless long-form reading.
- **Code & Metadata**: JetBrains Mono with warm syntax highlighting tokens.

Accessibility is never an afterthought. All interactive controls maintain at least 4.5:1 contrast against dynamic backgrounds.`,
    tags: ['Design Systems', 'UI/UX', 'CSS', 'Accessibility'],
    category: 'Design',
    readingTime: 3,
    wordCount: 520,
    publishedAt: '2026-11-07T18:15:00Z',
    updatedAt: '2026-11-07T18:15:00Z',
    visibility: 'public',
    likesCount: 265,
    commentsCount: 19,
    bookmarksCount: 94,
    viewsCount: 2150,
    isLiked: true,
    isBookmarked: false,
    tableOfContents: [
      { id: 'midnight-cyan-electric-glass-the-next-wave-of-publishing-interfaces', text: 'Midnight Cyan & Electric Glass: The Next Wave of Publishing Interfaces', level: 1 },
      { id: 'the-philosophy-of-ambient-contrast', text: 'The Philosophy of Ambient Contrast', level: 2 },
      { id: 'typography-hierarchy-in-long-form-tech-journalism', text: 'Typography Hierarchy in Long-Form Tech Journalism', level: 2 },
    ],
    communityId: 'comm-design',
  },
  {
    id: 'post-3',
    authorId: 'user-marcus-3',
    author: OTHER_USERS[1],
    title: 'Zero-Leak Memory Topologies in Long-Running Autonomous Agent Runtimes',
    slug: 'zero-leak-memory-topologies-autonomous-agents',
    excerpt:
      'Analyzing state snapshotting, context compression, and vector pruning strategies to maintain multi-turn context integrity over weeks of continuous operation.',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    content: `# Zero-Leak Memory Topologies in Long-Running Autonomous Agent Runtimes

When autonomous agents orchestrate multi-day software delivery cycles, raw token retention becomes unsustainable. Naive chat memory either overflows window capacity or introduces latency spikes.

## Three Tiers of Cognitive Storage

1. **Working Memory (Scratchpad)**: Transient task variables, current stack traces, active DOM refs. Evaporates upon stage completion.
2. **Episodic Memory**: Structured handoff summaries, decision trees, test verdicts, and user approvals.
3. **Semantic Memory**: Knowledge graph indices, user preferences (Creator DNA), domain style constraints.

By enforcing episodic compression at every handoff between Planner, Designer, Builder, and Tester, agents operate with sub-second decision latency.`,
    tags: ['Autonomous AI', 'Multi-Agent Systems', 'Architecture'],
    category: 'Engineering',
    readingTime: 5,
    wordCount: 940,
    publishedAt: '2026-11-06T11:00:00Z',
    updatedAt: '2026-11-06T11:00:00Z',
    visibility: 'public',
    likesCount: 512,
    commentsCount: 38,
    bookmarksCount: 210,
    viewsCount: 4600,
    isLiked: false,
    isBookmarked: true,
    tableOfContents: [
      { id: 'zero-leak-memory-topologies-in-long-running-autonomous-agent-runtimes', text: 'Zero-Leak Memory Topologies in Long-Running Autonomous Agent Runtimes', level: 1 },
      { id: 'three-tiers-of-cognitive-storage', text: 'Three Tiers of Cognitive Storage', level: 2 },
    ],
    communityId: 'comm-ai-ml',
  },
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    authorId: CURRENT_USER.id,
    author: CURRENT_USER,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    type: 'image',
    caption: 'Nexus Core 2.0 multi-agent engine deployed to staging. All 4 agents synchronized! ⚡',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    viewsCount: 1420,
  },
  {
    id: 'story-2',
    authorId: 'user-elena-2',
    author: OTHER_USERS[0],
    mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    type: 'image',
    caption: 'New interactive glass tokens just dropped. Check the design tab!',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 19).toISOString(),
    viewsCount: 980,
  },
  {
    id: 'story-3',
    authorId: 'user-marcus-3',
    author: OTHER_USERS[1],
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    type: 'text',
    caption: 'Research paper on deterministic multi-agent state machines accepted at NeurIPS workshop.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 16).toISOString(),
    viewsCount: 1840,
  },
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Autonomous agents, foundation models, fine-tuning, neural publishing, and cognitive architectures.',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    icon: 'Brain',
    membersCount: 42100,
    topics: ['Multi-Agent Systems', 'LLMs', 'Neural Nets', 'Research', 'Agentic UX'],
    rules: ['Provide reproducible code or citations', 'No synthetic spam without value', 'Be constructive'],
    moderators: ['alexvance', 'mthorne'],
    isJoined: true,
  },
  {
    id: 'comm-design',
    name: 'Next-Gen Design & UI/UX',
    slug: 'next-gen-design',
    description: 'Design systems, glassmorphism, micro-interactions, cyber-aesthetics, and accessible digital typography.',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    icon: 'Palette',
    membersCount: 28400,
    topics: ['Design Systems', 'Figma', 'CSS Architecture', 'Accessibility', 'Micro-Interactions'],
    rules: ['Respect intellectual property', 'Include color tokens with layouts', 'Maintain WCAG AA compliance'],
    moderators: ['elenarostova'],
    isJoined: true,
  },
  {
    id: 'comm-fullstack',
    name: 'Full Stack & Distributed Systems',
    slug: 'fullstack-distributed',
    description: 'High-throughput Node.js, TypeScript, PostgreSQL, WebSockets, Edge computing, and reliable microservices.',
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    icon: 'Layers',
    membersCount: 36700,
    topics: ['TypeScript', 'Node.js', 'PostgreSQL', 'Performance', 'APIs'],
    rules: ['Keep discussions technical and civil', 'Sanitize code snippets before sharing'],
    moderators: ['sophiacodes', 'alexvance'],
    isJoined: false,
  },
];

export const INITIAL_AGENT_TASKS: AgentTask[] = [
  {
    id: 'task-live-1',
    title: 'Autonomous Real-Time Knowledge Graph Visualizer',
    prompt:
      'Design and implement an interactive, force-directed SVG Knowledge Graph module showing bidirectional relationships between posts, topics, creators, and communities with category filtering.',
    status: 'completed',
    priority: 'high',
    category: 'engineering',
    recurrence: 'weekly',
    dueDate: '2026-11-15T18:00:00Z',
    estimatedHours: 12,
    orderIndex: 0,
    tags: ['SVG', 'Graph', 'Visualization'],
    subtasks: [
      { id: 'sub-1-1', title: 'Define KnowledgeGraphNode data contracts', completed: true },
      { id: 'sub-1-2', title: 'Implement force-directed SVG coordinate layout', completed: true },
      { id: 'sub-1-3', title: 'Add interactive category filter pills', completed: true },
      { id: 'sub-1-4', title: 'Verify WCAG AA contrast & keyboard navigation', completed: true },
    ],
    collaborators: [
      {
        id: 'user-elena-vance',
        name: 'Dr. Elena Vance',
        email: 'elena.vance@inkwave.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'lead',
      },
      {
        id: 'user-marcus-chen',
        name: 'Marcus Chen',
        email: 'marcus.chen@inkwave.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        role: 'contributor',
      },
    ],
    activeAgent: 'tester',
    creatorId: CURRENT_USER.id,
    createdAt: '2026-11-08T10:15:00Z',
    updatedAt: '2026-11-08T11:45:00Z',
    completedAt: '2026-11-08T11:45:00Z',
    retryCount: 0,
    approvalRequired: true,
    approvedBy: 'Alex Vance',
    plannerOutput: {
      taskTitle: 'Autonomous Real-Time Knowledge Graph Visualizer',
      problemStatement:
        'Users need an intuitive way to explore semantic connections between published articles, tags, authors, and communities rather than relying solely on linear text feeds.',
      objectives: [
        'Render interactive node graph with spring-physics simulation',
        'Support node click to highlight adjacent connections',
        'Provide instant node detail drawer and search filtering',
      ],
      requirements: [
        'SVG/Canvas rendering with 60fps responsiveness',
        'Responsive viewport adaptation',
        'Accessible fallback list view for screen readers',
      ],
      dependencies: ['src/types.ts', 'src/mockData.ts'],
      priority: 'high',
      acceptanceCriteria: [
        'Nodes render with distinct colors per category (article, topic, author, community)',
        'Clicking any node selects it and reveals connected entities',
        'Graph supports zoom and category filtering',
      ],
      suggestedAgent: 'designer',
      executionPlan: [
        '1. PLANNER creates architecture breakdown',
        '2. DESIGNER specifies node color tokens and pulse animations',
        '3. BUILDER develops KnowledgeGraphView component',
        '4. TESTER verifies node counts, connections, and responsive resizing',
      ],
      completionConditions: 'Graph renders cleanly across desktop and mobile with zero console errors.',
    },
    designerOutput: {
      designBrief: 'Cyber-minimalist cosmic relationship graph with electric blue and cyan glow vectors.',
      layoutSpecifications: 'Full-bleed interactive canvas with floating control HUD and transparent detail card.',
      componentStructure: ['KnowledgeGraphView', 'GraphControlsHUD', 'NodeDetailPanel', 'CategoryFilterPills'],
      colorTokens: {
        article: '#38bdf8',
        topic: '#818cf8',
        author: '#22d3ee',
        community: '#34d399',
        edgeLine: 'rgba(56, 189, 248, 0.25)',
      },
      typographySystem: {
        fontFamily: 'Space Grotesk, sans-serif',
        headingScale: 'text-lg font-semibold',
        bodyScale: 'text-xs font-mono',
      },
      responsiveBehavior: 'Auto-scales viewBox coordinates and transitions to stack layout on viewports < 768px.',
      interactionSpecifications: [
        'Hover node: Increase radius from 18px to 24px and pulse glow',
        'Click node: Pin selection and dim unrelated edges to 10% opacity',
      ],
      accessibilityRequirements: ['Keyboard navigation with Tab and Arrow keys', 'High-contrast text labels'],
      designAcceptanceCriteria: ['Contrast ratio >= 4.5:1', 'Zero layout shifts on hover'],
    },
    builderOutput: {
      implementationTasks: [
        'Create interactive SVG layout with dynamic circle and line vectors',
        'Add filter state for topic, author, and article nodes',
        'Implement side drawer for deep-dive links',
      ],
      filesChanged: ['src/components/KnowledgeGraph/KnowledgeGraphView.tsx'],
      apiEndpoints: ['GET /api/knowledge-graph'],
      databaseChanges: ['None (in-memory graph registry)'],
      architectureNotes: 'Used SVG coordinate projection with viewBox scaling for lightweight 60fps rendering.',
      codeSnippets: [
        {
          filename: 'src/components/KnowledgeGraph/KnowledgeGraphView.tsx',
          code: 'export function KnowledgeGraphView() { ... }',
          language: 'tsx',
        },
      ],
      testInstructions: 'Verify all 12 nodes render and clicking a node updates activeNode state.',
    },
    testerOutput: {
      suiteName: 'KnowledgeGraph Component & Edge Tests',
      totalTests: 6,
      passedTests: 6,
      failedTests: 0,
      executionStatus: 'passed',
      testResults: [
        {
          testName: 'Graph Nodes Quantity',
          testObjective: 'Confirm all nodes render correctly in SVG tree',
          executionStatus: 'passed',
          actualResult: '12 nodes rendered',
          expectedResult: '12 nodes rendered',
          severity: 'low',
          evidence: 'Verified SVG circle elements count matches node registry',
        },
        {
          testName: 'Node Selection State',
          testObjective: 'Clicking node sets active selection and dims peers',
          executionStatus: 'passed',
          actualResult: 'Node detail panel opened within 12ms',
          expectedResult: 'Node detail panel opens with matching details',
          severity: 'medium',
          evidence: 'Selected node state verified',
        },
      ],
      retestStatus: 'passed_first_run',
      performanceScore: 98,
      accessibilityCheck: 'WCAG AA Verified with aria-label on SVG group nodes',
    },
    logs: [
      {
        id: 'log-1',
        timestamp: '2026-11-08T10:15:00Z',
        agent: 'orchestrator',
        action: 'TASK_INITIALIZED',
        details: 'Task created by creator Alex Vance. Routed to PLANNER.',
        status: 'info',
      },
      {
        id: 'log-2',
        timestamp: '2026-11-08T10:22:00Z',
        agent: 'planner',
        action: 'PLAN_COMPLETED',
        details: 'Architecture plan finalized. Handed off to DESIGNER.',
        status: 'success',
      },
      {
        id: 'log-3',
        timestamp: '2026-11-08T10:35:00Z',
        agent: 'designer',
        action: 'DESIGN_COMPLETED',
        details: 'Visual tokens and layout specifications finalized. Handed off to BUILDER.',
        status: 'success',
      },
      {
        id: 'log-4',
        timestamp: '2026-11-08T11:10:00Z',
        agent: 'builder',
        action: 'CODE_IMPLEMENTED',
        details: 'KnowledgeGraphView developed and mounted. Handed off to TESTER.',
        status: 'success',
      },
      {
        id: 'log-5',
        timestamp: '2026-11-08T11:30:00Z',
        agent: 'tester',
        action: 'VERIFICATION_PASSED',
        details: 'All 6 test cases passed with 98% performance score. Submitted for human approval.',
        status: 'success',
      },
      {
        id: 'log-6',
        timestamp: '2026-11-08T11:45:00Z',
        agent: 'human',
        action: 'APPROVED_AND_COMPLETED',
        details: 'Human Creator Alex Vance reviewed and approved the implementation.',
        status: 'success',
      },
    ],
  },
  {
    id: 'task-live-2',
    title: 'Creator DNA Personalization & Writing Radar Engine',
    prompt:
      'Build the Creator DNA identity engine that analyzes writing patterns, topic distribution, and engagement consistency, displaying a live multi-axis radar chart.',
    status: 'awaiting_approval',
    priority: 'high',
    category: 'creative',
    recurrence: 'daily',
    dueDate: '2026-11-11T12:00:00Z',
    estimatedHours: 8,
    orderIndex: 1,
    tags: ['Analytics', 'AI', 'Radar'],
    subtasks: [
      { id: 'sub-2-1', title: 'Implement writing style metric engine', completed: true },
      { id: 'sub-2-2', title: 'Build 5-axis SVG polygon radar chart', completed: true },
      { id: 'sub-2-3', title: 'Finalize human creator review sign-off', completed: false },
    ],
    collaborators: [
      {
        id: 'user-sophia-lin',
        name: 'Sophia Lin',
        email: 'sophia@sophiacodes.design',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        role: 'reviewer',
      },
      {
        id: 'user-devon-miles',
        name: 'Devon Miles',
        email: 'devon.miles@flag-foundation.ai',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        role: 'contributor',
      },
    ],
    activeAgent: 'tester',
    creatorId: CURRENT_USER.id,
    createdAt: '2026-11-08T12:00:00Z',
    updatedAt: '2026-11-08T13:10:00Z',
    retryCount: 0,
    approvalRequired: true,
    plannerOutput: {
      taskTitle: 'Creator DNA Personalization & Writing Radar Engine',
      problemStatement: 'Writers need transparent feedback on their stylistic consistency, vocabulary depth, and topic affinity.',
      objectives: ['Calculate dynamic style radar', 'Provide actionable creator tips', 'Allow private privacy controls'],
      requirements: ['No sensitive inferences', 'User can edit or reset DNA data', 'SVG radar visualizer'],
      dependencies: ['src/types.ts', 'src/utils/creatorDna.ts'],
      priority: 'high',
      acceptanceCriteria: ['Radar renders 5 axes: Analytical, Storytelling, Conciseness, Technical Depth, Engagement'],
      suggestedAgent: 'builder',
      executionPlan: ['Plan logic -> Design radar SVG -> Implement component -> Run automated assertions'],
      completionConditions: 'Creator DNA displays accurately for active user.',
    },
    designerOutput: {
      designBrief: 'Sleek biometric-inspired radar dashboard with cyan polygon fill and percentage indicators.',
      layoutSpecifications: 'Two-column grid: Radar graph on left, topic breakdown & consistency progress on right.',
      componentStructure: ['CreatorDnaView', 'RadarPolygonChart', 'TopicPillList', 'DnaInsightCard'],
      colorTokens: { radarFill: 'rgba(56, 189, 248, 0.25)', radarStroke: '#38bdf8', gridLines: 'rgba(255,255,255,0.1)' },
      typographySystem: { fontFamily: 'Space Grotesk, sans-serif', headingScale: 'text-xl font-bold', bodyScale: 'text-sm' },
      responsiveBehavior: 'Collapses to single-column stack on mobile devices.',
      interactionSpecifications: ['Hover over radar point to show exact 0-100 score tooltip'],
      accessibilityRequirements: ['Textual summary alongside visual polygon'],
      designAcceptanceCriteria: ['High contrast against background card'],
    },
    builderOutput: {
      implementationTasks: ['Write calculation algorithm', 'Create SVG radar component', 'Connect to user posts state'],
      filesChanged: ['src/utils/creatorDna.ts', 'src/components/CreatorDNA/CreatorDnaView.tsx'],
      apiEndpoints: ['GET /api/creator-dna'],
      databaseChanges: ['None'],
      architectureNotes: 'Pure calculation module decoupled in src/utils/creatorDna.ts for deterministic unit testing.',
      codeSnippets: [{ filename: 'src/utils/creatorDna.ts', code: 'export function calculateCreatorDNA(...)', language: 'ts' }],
      testInstructions: 'Run npx tsx --test src/utils/pure_logic.test.ts',
    },
    testerOutput: {
      suiteName: 'Creator DNA Algorithm & Render Suite',
      totalTests: 4,
      passedTests: 4,
      failedTests: 0,
      executionStatus: 'passed',
      testResults: [
        {
          testName: 'Score Boundaries Test',
          testObjective: 'Ensure all radar scores stay between 0 and 100',
          executionStatus: 'passed',
          actualResult: 'Scores strictly bounded: 50-95',
          expectedResult: 'All values 0 <= score <= 100',
          severity: 'high',
          evidence: 'Unit test assert verified',
        },
      ],
      retestStatus: 'passed_first_run',
      performanceScore: 99,
      accessibilityCheck: 'Text alternative present for screen readers',
    },
    logs: [
      {
        id: 'log-10',
        timestamp: '2026-11-08T12:00:00Z',
        agent: 'orchestrator',
        action: 'TASK_INITIALIZED',
        details: 'Creator DNA task queued.',
        status: 'info',
      },
      {
        id: 'log-11',
        timestamp: '2026-11-08T12:20:00Z',
        agent: 'planner',
        action: 'PLAN_COMPLETED',
        details: 'Roadmap and data contracts defined.',
        status: 'success',
      },
      {
        id: 'log-12',
        timestamp: '2026-11-08T12:45:00Z',
        agent: 'builder',
        action: 'BUILD_COMPLETED',
        details: 'CreatorDnaView rendered and integrated.',
        status: 'success',
      },
      {
        id: 'log-13',
        timestamp: '2026-11-08T13:10:00Z',
        agent: 'tester',
        action: 'TESTS_PASSED',
        details: 'All tests passed. Awaiting human creator final sign-off.',
        status: 'success',
      },
    ],
  },
  {
    id: 'task-live-3',
    title: 'Cosmic Article Typography & Fluid Reading Scale',
    prompt:
      'Refactor reader font rendering with variable typography scales and responsive kerning for Sepia and Deep Space modes.',
    status: 'building',
    priority: 'medium',
    category: 'work',
    recurrence: 'none',
    dueDate: '2026-11-13T16:00:00Z',
    estimatedHours: 6,
    orderIndex: 2,
    tags: ['Design', 'Typography'],
    subtasks: [
      { id: 'sub-3-1', title: 'Audit variable font loading & fallback stacks', completed: true },
      { id: 'sub-3-2', title: 'Tune fluid clamp() scale for Sepia & Deep Space', completed: false },
      { id: 'sub-3-3', title: 'Verify line-length constraints on mobile viewports', completed: false },
      { id: 'sub-3-4', title: 'Run visual regression check across themes', completed: false },
    ],
    activeAgent: 'builder',
    creatorId: CURRENT_USER.id,
    createdAt: '2026-11-09T09:00:00Z',
    updatedAt: '2026-11-09T10:30:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [
      {
        id: 'log-20',
        timestamp: '2026-11-09T09:00:00Z',
        agent: 'orchestrator',
        action: 'TASK_INITIALIZED',
        details: 'Typography optimization task initialized.',
        status: 'info',
      },
      {
        id: 'log-21',
        timestamp: '2026-11-09T09:30:00Z',
        agent: 'planner',
        action: 'PLAN_COMPLETED',
        details: 'Scale ratios and font metric tokens planned.',
        status: 'success',
      },
      {
        id: 'log-22',
        timestamp: '2026-11-09T10:00:00Z',
        agent: 'designer',
        action: 'DESIGN_COMPLETED',
        details: 'Design tokens established for Light, Sepia, and Deep Space themes.',
        status: 'success',
      },
    ],
  },
  {
    id: 'task-live-4',
    title: 'Cross-Node Vector Memory Compression Benchmark',
    prompt:
      'Run stress test comparisons on multi-turn context retention across long-running autonomous agent sessions.',
    status: 'planning',
    priority: 'low',
    category: 'research',
    recurrence: 'monthly',
    dueDate: '2026-11-30T18:00:00Z',
    estimatedHours: 16,
    orderIndex: 3,
    tags: ['Performance', 'Research'],
    subtasks: [
      { id: 'sub-4-1', title: 'Prepare synthetic 10k-turn context dataset', completed: false },
      { id: 'sub-4-2', title: 'Benchmark quantization vs sliding window retention', completed: false },
      { id: 'sub-4-3', title: 'Document latency & memory tradeoff report', completed: false },
    ],
    activeAgent: 'planner',
    creatorId: CURRENT_USER.id,
    createdAt: '2026-11-09T14:00:00Z',
    updatedAt: '2026-11-09T14:15:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [
      {
        id: 'log-30',
        timestamp: '2026-11-09T14:00:00Z',
        agent: 'orchestrator',
        action: 'TASK_INITIALIZED',
        details: 'Research benchmark task queued in PLANNER backlog.',
        status: 'info',
      },
    ],
  },
  {
    id: 'task-live-5',
    title: 'Personal Publishing Goals & Weekly Streak Tracker',
    prompt:
      'Design personal motivation dashboard showing weekly publishing consistency, reading velocity, and streak multipliers.',
    status: 'pending',
    priority: 'low',
    category: 'personal',
    recurrence: 'weekly',
    dueDate: '2026-11-17T12:00:00Z',
    estimatedHours: 4,
    orderIndex: 4,
    activeAgent: 'planner',
    creatorId: CURRENT_USER.id,
    createdAt: '2026-11-10T02:00:00Z',
    updatedAt: '2026-11-10T02:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [
      {
        id: 'log-40',
        timestamp: '2026-11-10T02:00:00Z',
        agent: 'orchestrator',
        action: 'TASK_INITIALIZED',
        details: 'Personal tracking task initialized.',
        status: 'info',
      },
    ],
  },
];

export const INITIAL_KNOWLEDGE_NODES: KnowledgeGraphNode[] = [
  {
    id: 'node-post-1',
    label: 'The Multi-Agent Symphony',
    type: 'article',
    group: 'Engineering',
    connections: ['node-topic-ai', 'node-topic-multi-agent', 'node-author-alex', 'node-comm-ai'],
  },
  {
    id: 'node-post-2',
    label: 'Midnight Cyan & Electric Glass',
    type: 'article',
    group: 'Design',
    connections: ['node-topic-design', 'node-author-elena', 'node-comm-design'],
  },
  {
    id: 'node-post-3',
    label: 'Zero-Leak Memory Topologies',
    type: 'article',
    group: 'Engineering',
    connections: ['node-topic-multi-agent', 'node-author-marcus', 'node-comm-ai'],
  },
  { id: 'node-topic-ai', label: 'Artificial Intelligence', type: 'topic', group: 'Topic', connections: ['node-post-1', 'node-comm-ai'] },
  {
    id: 'node-topic-multi-agent',
    label: 'Multi-Agent Systems',
    type: 'topic',
    group: 'Topic',
    connections: ['node-post-1', 'node-post-3', 'node-author-alex', 'node-author-marcus'],
  },
  { id: 'node-topic-design', label: 'Design Systems', type: 'topic', group: 'Topic', connections: ['node-post-2', 'node-comm-design'] },
  { id: 'node-author-alex', label: 'Alex Vance', type: 'author', group: 'Creator', connections: ['node-post-1', 'node-topic-multi-agent'] },
  { id: 'node-author-elena', label: 'Elena Rostova', type: 'author', group: 'Creator', connections: ['node-post-2', 'node-topic-design'] },
  { id: 'node-author-marcus', label: 'Dr. Marcus Thorne', type: 'author', group: 'Creator', connections: ['node-post-3', 'node-topic-multi-agent'] },
  { id: 'node-comm-ai', label: 'AI & ML World', type: 'community', group: 'Community', connections: ['node-post-1', 'node-post-3'] },
  { id: 'node-comm-design', label: 'Design & UI/UX World', type: 'community', group: 'Community', connections: ['node-post-2'] },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'agent',
    title: 'NEXUS CORE: Approval Required',
    message: 'Task "Creator DNA Personalization Engine" has completed testing and awaits your approval.',
    createdAt: '15 minutes ago',
    read: false,
    link: 'nexus-core',
  },
  {
    id: 'notif-2',
    type: 'like',
    title: 'New Like on your Article',
    message: 'Elena Rostova and 14 others liked "The Multi-Agent Symphony".',
    createdAt: '1 hour ago',
    read: false,
    link: 'feed',
  },
  {
    id: 'notif-3',
    type: 'follow',
    title: 'New Creator Follower',
    message: 'Dr. Marcus Thorne started following your research.',
    createdAt: '3 hours ago',
    read: true,
  },
];

export const INITIAL_NOVA_MEMORIES: NovaMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'style',
    content: 'User prefers concise, high-density technical analysis with code snippets and architecture diagrams.',
    createdAt: '2026-11-05',
  },
  {
    id: 'mem-2',
    category: 'goal',
    content: 'Preparing a 4-part series on Autonomous Multi-Agent Publishing Networks for Q4.',
    createdAt: '2026-11-06',
  },
  {
    id: 'mem-3',
    category: 'interest',
    content: 'Deep interest in low-latency WebSockets, glassmorphic UI, and ethical AI governance.',
    createdAt: '2026-11-07',
  },
];

export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-elena',
    senderId: 'user-elena-2',
    recipientId: CURRENT_USER.id,
    content: 'Hey Alex! Loved your latest breakdown on the Planner and Tester handoffs. The sequence diagrams are crisp.',
    createdAt: '10:45 AM',
    read: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-elena',
    senderId: CURRENT_USER.id,
    recipientId: 'user-elena-2',
    content: 'Thanks Elena! We are implementing your new glass tokens into the NEXUS CORE command center today.',
    createdAt: '10:50 AM',
    read: true,
  },
];
