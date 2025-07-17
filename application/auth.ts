'use client'
import {
    signOutAction,
    deleteAccountAction,
    updateAccountAction,
} from '@/data/auth'
import useSWR from 'swr'
import { GetResponse } from '@/app/api/me/route'
import { AccountData } from '@/core'

export function useAuth() {
    const { data, isLoading, error, mutate } = useSWR(
        '/api/me',
        async function (url: string) {
            const res = await fetch(url)
            if (res.status !== 200) {
                throw new Error('Failed to fetch user')
            }
            const data: GetResponse = await res.json()
            return data
        }
    )

    async function signOut() {
        const result = await mutate(async function () {
            const result = await signOutAction()
            if (result) {
                return {
                    user: null,
                }
            }
            throw new Error('Failed to sign out')
        }, {
            optimisticData: {
                user: null,
            },
        })
        return result?.user === null
    }
    async function deleteAccount() {
        mutate(async function () {
            const result = await deleteAccountAction()
            if (result) {
                return {
                    user: null,
                }
            }
            throw new Error('Failed to delete account')
        }, {
            optimisticData: {
                user: null,
            },
        })
    }

    async function updateAccount({ name, emoji }: { name?: string, emoji?: string }) {
        if (!user) {
            throw new Error('User not authenticated')
        }

        const result = await mutate(async function () {
            const updatedUser = await updateAccountAction({ name, emoji })
            if (updatedUser) {
                return {
                    user: updatedUser,
                } satisfies GetResponse
            }
            throw new Error('Failed to update account')
        }, {
            optimisticData: data?.user ? {
                user: {
                    ...data.user,
                    name: name !== undefined ? name : data.user.name,
                    emoji: emoji !== undefined ? emoji : data.user.emoji,
                }
            } : undefined,
            rollbackOnError: true,
            revalidate: false,
        })

        return result?.user ?? null
    }

    const user: AccountData | undefined = data?.user ?? undefined

    return {
        user,
        updateAccount,
        deleteAccount,
        signOut,
        isLoading,
        error,
    }
}

