import React from 'react'
import { HistoryEntry } from './HistoryEntry'
import { ReadingHistoryEntry } from '@/data/history'

export function ReadingHistory({ history, showFullHistoryLink }: {
    history: ReadingHistoryEntry[],
    showFullHistoryLink?: React.ReactNode,
}) {
    return <div className='flex gap-3 overflow-auto snap-x snap-mandatory py-xl px-4 h-80 items-center' style={{
        scrollbarWidth: 'none',
    }}>
        {
            history.map((entry, idx) => {
                if (!entry) return null

                return <HistoryEntry key={`${entry.booqId}-${idx}`} entry={entry} />
            })
        }
        {showFullHistoryLink && (
            <div className='flex snap-center items-center justify-center px-4'>
                {showFullHistoryLink}
            </div>
        )}
    </div>
}