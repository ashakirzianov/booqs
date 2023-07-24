'use client'
import { AppProvider } from '@/application'
import { Reader } from '@/reader/Reader'
import type { BooqData } from './fetch'
import { BooqRange } from '@/core'

export function ClientReader({ booq, quote }: {
    booq: BooqData,
    quote?: BooqRange,
}) {
    return <AppProvider>
        <Reader booq={booq} quote={quote} />
    </AppProvider>
}