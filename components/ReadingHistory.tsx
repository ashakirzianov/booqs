import React from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { BooqLink } from '@/components/Links'
import { pageForPosition } from '@/application/common'
import { BooqPath } from '@/core'


export type ReadingHistoryEntry = {
    booqId: string,
    title: string | undefined,
    path: BooqPath,
    preview: string,
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
                        <BooqLink booqId={entry.booqId} path={entry.path}>
                            <BooqPreview
                                path={entry.path}
                                text={entry.preview}
                                title={entry.title ?? ''}
                                page={pageForPosition(entry.position)}
                                total={pageForPosition(entry.length)}
                            />
                        </BooqLink>
                    </div>
            )
        }
    </div>
}