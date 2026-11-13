import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (authenticated with Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Published Articles table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  slug: text('slug'),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  category: text('category'),
  readingTime: integer('reading_time').default(3),
  wordCount: integer('word_count').default(400),
  likesCount: integer('likes_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Read Later Collection table
export const readLater = pgTable('read_later', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  postId: integer('post_id')
    .references(() => posts.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Gemini Chat Sessions table
export const geminiChats = pgTable('gemini_chats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  role: text('role').default('creative_publisher'),
  title: text('title').notNull(),
  messages: text('messages').notNull(), // JSON stringified chat messages array
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  readLaterItems: many(readLater),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  savedInReadLater: many(readLater),
}));

export const readLaterRelations = relations(readLater, ({ one }) => ({
  user: one(users, {
    fields: [readLater.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [readLater.postId],
    references: [posts.id],
  }),
}));
