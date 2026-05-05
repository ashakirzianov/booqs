'use client'

import type { GetResponse } from '@/app/api/users/[username]/following/route'
import { AnnotationAuthorData } from '@/data/annotations'
import useSWR from 'swr'

export function useFollowingData({ user }: { user: AnnotationAuthorData | undefined }) {
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