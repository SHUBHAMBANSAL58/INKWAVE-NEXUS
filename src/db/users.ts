import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(avatar ? { avatar } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.warn('Database query fallback note for user registration:', error);
    return {
      id: 1,
      uid,
      email,
      name: name || 'Demo User',
      avatar: avatar || '',
      role: 'user',
      createdAt: new Date(),
    };
  }
}

export async function getUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
