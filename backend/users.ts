import slugify from 'slugify'
import { deleteAllBooksForUserId } from './uu'
import { deleteUserCredentials } from './passkey'
import { estimatedRowCount, sql } from './db'
import { AccountData } from '@/core'

export type DbUser = {
    id: string,
    username: string,
    email: string | null,
    name: string | null,
    profile_picture_url: string | null,
    joined_at: string,
    emoji: string,
}

export function accountDataFromDbUser(dbUser: DbUser): AccountData {
    return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email ?? undefined,
        joinedAt: dbUser.joined_at,
        name: dbUser.name ?? undefined,
        profilePictureURL: dbUser.profile_picture_url ?? undefined,
        emoji: dbUser.emoji ?? undefined,
    }
}

export async function userForId(id: string): Promise<DbUser | null> {
    const [user] = await sql`
      SELECT * FROM users
      WHERE id = ${id}
    `
    return user ? (user as DbUser) : null
}

export async function userForEmail(email: string): Promise<DbUser | null> {
    const [user] = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `
    return user ? (user as DbUser) : null
}

export async function createUser({
    username, email, name, profilePictureUrl,
}: {
    username?: string,
    email?: string,
    name?: string,
    profilePictureUrl?: string
}): Promise<DbUser> {
    username = username ?? await proposeUsername({
        name, email,
    })
    const emoji = getRandomEmoji()
    const [user] = await sql`
      INSERT INTO users (username, email, name, profile_picture_url, emoji)
      VALUES (${username}, ${email ?? null}, ${name ?? null}, ${profilePictureUrl ?? null}, ${emoji})
      RETURNING *
    `
    return user as DbUser
}

export async function deleteUserForId(id: string): Promise<boolean> {
    const deleteUserPromise = await deleteDbUserForId(id)
    const deleteBooksPromise = deleteAllBooksForUserId(id)
    const deleteCredentialsPromise = deleteUserCredentials(id)

    const [
        deleteUserResult,
        deleteBooksResult,
        _deleteCredentialsResult,
    ] = await Promise.all([
        deleteUserPromise,
        deleteBooksPromise,
        deleteCredentialsPromise,
    ])
    return deleteUserResult && deleteBooksResult
}

async function deleteDbUserForId(id: string) {
    const result = await sql`
    DELETE FROM users
    WHERE id = ${id}
  `
    return result.length > 0
}

async function isUserExistForUsername(username: string): Promise<boolean> {
    const [user] = await sql`
      SELECT 1 FROM users
      WHERE username = ${username}
      LIMIT 1
    `
    return Boolean(user)
}

type UserDataForNameGeneration = {
    name?: string,
    email?: string,
}
async function proposeUsername(user: UserDataForNameGeneration) {
    const base = generateUsername(user)
    let current = base
    let next = current
    let idx = await estimatedRowCount('users') ?? 0
    let existing: any
    do {
        current = next
        existing = await isUserExistForUsername(current)
        next = `${base}${++idx}`
    } while (existing)
    return current
}

function generateUsername({ name, email }: UserDataForNameGeneration) {
    const base = name ?? email ?? 'user'
    const username = slugify(base, {
        replacement: '.',
        lower: true,
        strict: true,
        locale: 'en',
    })
    return username
}

const USER_EMOJIS = [
    '😊', '😄', '😃', '😁', '😌', '😉', '😎', '🤓', '🤗', '🙂',
    '🤔', '🤠', '😇', '😋', '😍', '🥰', '🤩', '😚', '😙', '😗',
    '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🦊',
    '🐧', '🦆', '🐺', '🐴', '🦄', '🐮', '🐷', '🐹', '🐭', '🐶'
]

export async function updateUser({
    id,
    name,
    emoji,
}: {
    id: string,
    name?: string,
    emoji?: string,
}): Promise<DbUser | null> {
    if (name === undefined && emoji === undefined) {
        return null
    }

    const [user] = await sql`
        UPDATE users
        SET
            ${name !== undefined ? sql`name = ${name}` : sql``}
            ${name !== undefined && emoji !== undefined ? sql`,` : sql``}
            ${emoji !== undefined ? sql`emoji = ${emoji}` : sql``}
        WHERE id = ${id}
        RETURNING *
    `
    return user ? (user as DbUser) : null
}

function getRandomEmoji(): string {
    return USER_EMOJIS[Math.floor(Math.random() * USER_EMOJIS.length)]
}