import { deleteAllBooksForUserId } from './uu'
import { deleteUserCredentials } from './passkey'
import { sql } from './db'
import { getRandomAvatarEmoji } from '@/core'
import { nanoid } from 'nanoid'

export type DbUser = {
    id: string,
    username: string,
    email: string,
    name: string,
    profile_picture_url: string | null,
    joined_at: string,
    emoji: string,
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

export async function userForUsername(username: string): Promise<DbUser | null> {
    const [user] = await sql`
      SELECT * FROM users
      WHERE username = ${username}
    `
    return user ? (user as DbUser) : null
}

export async function usersForIds(ids: string[]): Promise<DbUser[]> {
    if (ids.length === 0) {
        return []
    }
    
    const users = await sql`
      SELECT * FROM users
      WHERE id = ANY(${ids})
    `
    return users as DbUser[]
}

export type CreateUserResult =
    | { success: true, user: DbUser }
    | { success: false, reason: string }

export type UpdateUserResult =
    | { success: true, user: DbUser }
    | { success: false, user?: undefined, reason: string }

function validateUsername(username: string): boolean {
    // Username must contain only latin letters, digits, and hyphens
    const usernamePattern = /^[a-zA-Z0-9-]+$/
    return usernamePattern.test(username)
}

export async function createUser({
    username, email, name, profilePictureUrl, emoji,
}: {
    username: string,
    email: string,
    name: string,
    profilePictureUrl?: string,
    emoji?: string,
}): Promise<CreateUserResult> {
    try {
        // Validate username format
        if (!validateUsername(username)) {
            return {
                success: false,
                reason: 'Username must contain only latin letters, digits, and hyphens'
            }
        }

        // Lowercase the username
        const normalizedUsername = username.toLowerCase()

        const id = nanoid()
        const userEmoji = emoji ?? getRandomAvatarEmoji()
        const [user] = await sql`
          INSERT INTO users (id, username, email, name, profile_picture_url, emoji)
          VALUES (${id}, ${normalizedUsername}, ${email}, ${name}, ${profilePictureUrl ?? null}, ${userEmoji})
          RETURNING *
        `
        return { success: true, user: user as DbUser }
    } catch (err: any) {
        console.error('Error creating user:', err)
        const reason = getReasonFromError(err, 'Failed to create user')
        return { success: false, reason }
    }
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


export async function updateUser({
    id,
    name,
    emoji,
}: {
    id: string,
    name?: string,
    emoji?: string,
}): Promise<UpdateUserResult> {
    try {
        if (name === undefined && emoji === undefined) {
            return { success: false, reason: 'No fields provided to update' }
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

        if (!user) {
            return { success: false, reason: 'User not found' }
        }

        return { success: true, user: user as DbUser }
    } catch (err: any) {
        console.error('Error updating user:', err)
        const reason = getReasonFromError(err, 'Failed to update user')
        return { success: false, reason }
    }
}

function getReasonFromError(err: any, defaultReason: string): string {
    // Handle specific database errors
    if (err.code === '23505') { // unique_violation
        if (err.constraint === 'users_username_key') {
            return 'Username already exists'
        }
        if (err.constraint === 'users_email_key') {
            return 'Email already exists'
        }
    }

    return defaultReason
}

