'use server'
import { BooqPath } from '@/core'
import { fetchAuthData } from './auth'
import { addBooqHistory } from '@/backend/history'

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
        date: Date.now(),
    })
}