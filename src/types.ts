export type AgentType = 'planner' | 'designer' | 'builder' | 'tester';

export type TaskStatus =
  | 'pending'
  | 'planning'
  | 'designing'
  | 'ready_for_implementation'
  | 'building'
  | 'testing'
  | 'failed'
  | 'awaiting_approval'
  | 'completed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface PlannerOutput {
  taskTitle: string;
  problemStatement: string;
  objectives: string[];
  requirements: string[];
  dependencies: string[];
  priority: TaskPriority;
  acceptanceCriteria: string[];
  suggestedAgent: AgentType;
  executionPlan: string[];
  completionConditions: string;
}

export interface DesignerOutput {
  designBrief: string;
  layoutSpecifications: string;
  componentStructure: string[];
  colorTokens: Record<string, string>;
  typographySystem: {
    fontFamily: string;
    headingScale: string;
    bodyScale: string;
  };
  responsiveBehavior: string;
  interactionSpecifications: string[];
  accessibilityRequirements: string[];
  designAcceptanceCriteria: string[];
}

export interface BuilderOutput {
  implementationTasks: string[];
  filesChanged: string[];
  apiEndpoints: string[];
  databaseChanges: string[];
  architectureNotes: string;
  codeSnippets: { filename: string; code: string; language: string }[];
  testInstructions: string;
}

export interface TestResultItem {
  testName: string;
  testObjective: string;
  executionStatus: 'passed' | 'failed' | 'skipped';
  actualResult: string;
  expectedResult: string;
  reproductionSteps?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  suggestedCorrection?: string;
}

export interface TesterOutput {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionStatus: 'passed' | 'failed';
  testResults: TestResultItem[];
  retestStatus: string;
  performanceScore: number;
  accessibilityCheck: string;
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  agent: AgentType | 'orchestrator' | 'human';
  action: string;
  details: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export type TaskCategory = 'personal' | 'work' | 'creative' | 'research' | 'engineering';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface TaskCollaborator {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role?: 'lead' | 'contributor' | 'reviewer' | 'observer';
  assignedAt?: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory;
  recurrence?: RecurrenceFrequency;
  recurrenceParentId?: string;
  nextRunDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  completedAt?: string;
  orderIndex?: number;
  blockedByTaskIds?: string[];
  focusTimeSeconds?: number;
  collaborators?: TaskCollaborator[];
  assignees?: TaskCollaborator[];
  subtasks?: TaskSubtask[];
  tags?: string[];
  projectFolder?: string;
  archived?: boolean;
  sentimentMood?: 'calm' | 'focused' | 'complex' | 'urgent';
  activeAgent: AgentType;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  approvalRequired: boolean;
  approvedBy?: string;
  rejectionReason?: string;
  plannerOutput?: PlannerOutput;
  designerOutput?: DesignerOutput;
  builderOutput?: BuilderOutput;
  testerOutput?: TesterOutput;
  logs: AgentExecutionLog[];
}

export interface BlueprintTaskItem {
  id?: string;
  title: string;
  prompt: string;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedHours?: number;
  recurrence?: RecurrenceFrequency;
  blockedByIndices?: number[];
  collaborators?: TaskCollaborator[];
}

export interface TaskBlueprint {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  tasks: BlueprintTaskItem[];
  isCustom?: boolean;
  createdAt: string;
  authorName?: string;
  authorId?: string;
}

// User & Profiles
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  interests: string[];
  skills: string[];
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  role: 'user' | 'moderator' | 'admin';
  creatorBadges: string[];
}

export interface TableOfContentItem {
  id: string;
  text: string;
  level: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: string;
  readingTime: number; // minutes
  wordCount: number;
  publishedAt: string;
  updatedAt: string;
  visibility: 'public' | 'followers' | 'private' | 'unlisted';
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  tableOfContents?: TableOfContentItem[];
  communityId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Story {
  id: string;
  authorId: string;
  author: User;
  mediaUrl: string;
  type: 'image' | 'text';
  caption: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  icon: string;
  membersCount: number;
  topics: string[];
  rules: string[];
  moderators: string[];
  isJoined?: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'agent' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'article' | 'topic' | 'author' | 'community';
  group: string;
  connections: string[];
  url?: string;
}

export interface CreatorDNA {
  userId: string;
  consistencyScore: number; // 0-100
  vocabularyRichness: number; // 0-100
  dominantTopics: { topic: string; percentage: number }[];
  styleRadar: {
    analytical: number;
    storytelling: number;
    conciseness: number;
    technicalDepth: number;
    engagement: number;
  };
  summary: string;
}

export interface LibraryItem {
  id: string;
  userId: string;
  postId?: string;
  post?: Post;
  note?: string;
  highlight?: string;
  collection: string;
  createdAt: string;
}

export interface NovaMemoryItem {
  id: string;
  category: 'preference' | 'style' | 'interest' | 'goal' | 'project';
  content: string;
  createdAt: string;
}

export interface NovaMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  intent?: string;
  agentRouted?: AgentType;
  actionTaken?: string;
  suggestedFollowUps?: string[];
}

export interface CreatorTwinPersona {
  tone: 'analytical' | 'visionary' | 'conversational' | 'academic';
  creativityLevel: number; // 0-100
  concisenessLevel: number; // 0-100
  technicalDepthLevel: number; // 0-100
  activeVoicePreference: boolean;
  bannedCliches: string[];
  signaturePhrases: string[];
  customDirective: string;
}

export interface ArticleRevision {
  id: string;
  version: string;
  title: string;
  content: string;
  timestamp: string;
  authorName: string;
  changeSummary: string;
}

export interface CreatorQuest {
  id: string;
  title: string;
  description: string;
  category: 'publishing' | 'intelligence' | 'collaboration';
  progress: number;
  maxProgress: number;
  completed: boolean;
  xpReward: number;
  badgeIcon: string;
}
