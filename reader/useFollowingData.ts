'use client'

import { AuthorData } from '@/core'
import type { GetResponse } from '@/app/api/users/[username]/following/route'
import useSWR from 'swr'

export function useFollowingData({ user }: { user: AuthorData | undefined }) {
    const { data: followingData, isLoading } = useSWR(
        user ? `/api/users/${user.username}/following` : null,
        async (url: string) => {
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error('Failed to fetch following data')
            }
            return res.json() as Promise<GetResponse>
        }
    )

    const followingUserIds = followingData?.following?.map(u => u.id) ?? []

    return {
        followingUserIds,
        isLoading,
    }
}