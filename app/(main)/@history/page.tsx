'use client'
import { AppProvider } from '@/application'
import { ReadingHistory } from '@/components/ReadingHistory'

export default function HistroySlot() {
    return <AppProvider>
        <ReadingHistory />
    </AppProvider>
}
