import { sql } from './db'

export const AI_USER_ID = 'booqs-ai'

const AI_USER = {
    id: AI_USER_ID,
    username: 'booqs-ai',
    email: 'ai@booqs.app',
    name: 'Booqs AI',
    emoji: '🤖',
} as const

export async function ensureAiUser(): Promise<void> {
    await sql`
        INSERT INTO users (id, username, email, name, emoji)
        VALUES (${AI_USER.id}, ${AI_USER.username}, ${AI_USER.email}, ${AI_USER.name}, ${AI_USER.emoji})
        ON CONFLICT (id) DO NOTHING
    `
}
