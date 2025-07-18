'use server'
import { BooqId, BooqPath, AccountPublicData } from '@/core'
import { fetchAuthData } from './auth'
import { addBooqHistory } from '@/backend/history'
import { userForUsername, DbUser } from '@/backend/users'

export async function reportBooqHistory({
    booqId, path, source,
}: {
    booqId: BooqId,
    path: BooqPath,
    source: string,
}) {
    const user = await fetchAuthData()
    if (!user) {
        return {
            success: false,
            error: 'Not authenticated',
        } as const
    }
    addBooqHistory(user.id, {
        booqId, path, source,
        date: Date.now(),
    })
}

export async function userData(username: string): Promise<AccountPublicData | null> {
    const dbUser = await userForUsername(username)
    if (!dbUser) {
        return null
    }
    return accountPublicDataFromDbUser(dbUser)
}

function accountPublicDataFromDbUser(dbUser: DbUser): AccountPublicData {
    return {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        profilePictureURL: dbUser.profile_picture_url ?? undefined,
        emoji: dbUser.emoji,
        joinedAt: dbUser.joined_at,
    }
}