'use server'
import { BooqPath } from '@/core'
import { fetchAuthData } from './auth'
import { addBooqHistory } from '@/backend/users'

export async function reportBooqHistory({
    booqId, path, source,
}: {
    booqId: string,
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
        date: new Date(Date.now()),
    })
}