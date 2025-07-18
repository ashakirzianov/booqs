'use server'
import { BooqId, BooqPath, AccountData } from '@/core'
import { fetchAuthData } from './auth'
import { addBooqHistory } from '@/backend/history'
import { userForUsername, accountDataFromDbUser } from '@/backend/users'

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

export async function userData(username: string): Promise<AccountData | null> {
    const dbUser = await userForUsername(username)
    if (!dbUser) {
        return null
    }
    return accountDataFromDbUser(dbUser)
}