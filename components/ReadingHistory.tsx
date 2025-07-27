import React from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { pageForPosition } from '@/application/common'
import Link from 'next/link'
import { booqHref } from '../common/href'
import { DetailedReadingHistoryEntry } from '@/data/history'

export function ReadingHistory({ history, showFullHistoryLink }: {
    history: DetailedReadingHistoryEntry[],
    showFullHistoryLink?: React.ReactNode,
}) {
    return <div className='flex gap-3 overflow-auto snap-x snap-mandatory py-xl px-4 h-80' style={{
        scrollbarWidth: 'none',
    }}>
        {
            history.map(
                (entry, idx) =>
                    <div key={idx} className='flex snap-center'>
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
        {showFullHistoryLink && (
            <div className='flex snap-center items-center justify-center px-4'>
                {showFullHistoryLink}
            </div>
        )}
    </div>
}