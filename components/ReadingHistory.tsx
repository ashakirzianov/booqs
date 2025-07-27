import React from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { BooqCover } from '@/components/BooqCover'
import { pageForPosition } from '@/application/common'
import Link from 'next/link'
import { booqHref } from '../common/href'
import { DetailedReadingHistoryEntry, BriefReadingHistoryEntry, ReadingHistoryEntry } from '@/data/history'

export function ReadingHistory({ history, showFullHistoryLink }: {
    history: ReadingHistoryEntry[],
    showFullHistoryLink?: React.ReactNode,
}) {
    return <div className='flex gap-3 overflow-auto snap-x snap-mandatory py-xl px-4 h-80' style={{
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

function HistoryEntry({ entry }: {
    entry: DetailedReadingHistoryEntry | BriefReadingHistoryEntry
}) {
    if ('text' in entry) {
        return <DetailedEntry entry={entry} />
    } else {
        return <BriefEntry entry={entry} />
    }
}

function DetailedEntry({ entry }: { entry: DetailedReadingHistoryEntry }) {
    return (
        <div className='flex snap-center'>
            <Link href={booqHref({ booqId: entry.booqId, path: entry.path })}>
                <BooqPreview
                    path={entry.path}
                    text={entry.text}
                    title={entry.title ?? ''}
                    page={pageForPosition(entry.position)}
                    total={pageForPosition(entry.booqLength)}
                />
            </Link>
        </div>
    )
}

function BriefEntry({ entry }: { entry: BriefReadingHistoryEntry }) {
    return (
        <div className='flex snap-center'>
            <Link href={booqHref({ booqId: entry.booqId, path: entry.path })}>
                <BooqCover
                    booqId={entry.booqId}
                    coverSrc={entry.coverSrc}
                    title={entry.title}
                    author={entry.authors[0]}
                    size={90}
                />
            </Link>
        </div>
    )
}