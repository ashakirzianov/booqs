import React from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { pageForPosition } from '@/application/common'
import { BooqId, BooqPath } from '@/core'
import Link from 'next/link'
import { booqHref } from '../core/href'


export type ReadingHistoryEntry = {
    booqId: BooqId,
    title?: string,
    path: BooqPath,
    text: string,
    position: number,
    length: number,
}
export function ReadingHistory({ history }: {
    history: ReadingHistoryEntry[],
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
                                total={pageForPosition(entry.length)}
                            />
                        </Link>
                    </div>
            )
        }
    </div>
}