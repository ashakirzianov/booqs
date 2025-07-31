'use client'

import React, { useState } from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { BooqCover } from '@/components/BooqCover'
import { CloseIcon } from '@/components/Icons'
import { pageForPosition } from '@/application/common'
import Link from 'next/link'
import { booqHref } from '../../common/href'
import { DetailedReadingHistoryEntry, BriefReadingHistoryEntry, ReadingHistoryEntry, removeHistoryEntryAction } from '@/data/history'

export function HistoryEntry({ entry }: {
    entry: ReadingHistoryEntry
}) {
    const [isRemoved, setIsRemoved] = useState(false)

    async function handleRemove() {
        if (isRemoved) return

        setIsRemoved(true)
        try {
            const result = await removeHistoryEntryAction({ booqId: entry.booqId })
            if (!result.success) {
                console.error('Failed to remove history entry:', result.error)
                setIsRemoved(false)
            }
        } catch (error) {
            console.error('Failed to remove history entry:', error)
            setIsRemoved(false)
        }
    }

    if (isRemoved) {
        return <RemovedEntryPlaceholder />
    }

    if ('text' in entry) {
        return <DetailedEntry entry={entry} onRemove={handleRemove} />
    } else {
        return <BriefEntry entry={entry} onRemove={handleRemove} />
    }
}

function DetailedEntry({ entry, onRemove }: {
    entry: DetailedReadingHistoryEntry,
    onRemove: () => void
}) {
    return (
        <div className='flex snap-center relative group'>
            <Link href={booqHref({ booqId: entry.booqId, path: entry.path })}>
                <BooqPreview
                    path={entry.path}
                    text={entry.text}
                    title={entry.title ?? ''}
                    page={pageForPosition(entry.position)}
                    total={pageForPosition(entry.booqLength)}
                />
            </Link>
            <button
                onClick={onRemove}
                className='absolute top-2 right-2 w-6 h-6 bg-background/80 hover:bg-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border'
                title='Remove from history'
            >
                <div className='w-3 h-3 text-alert'>
                    <CloseIcon />
                </div>
            </button>
        </div>
    )
}

function BriefEntry({ entry, onRemove }: {
    entry: BriefReadingHistoryEntry,
    onRemove: () => void
}) {
    return (
        <div className='flex snap-center relative group'>
            <Link href={booqHref({ booqId: entry.booqId, path: entry.path })}>
                <BooqCover
                    cover={entry.cover}
                    title={entry.title}
                    author={entry.authors[0]}
                />
            </Link>
            <button
                onClick={onRemove}
                className='absolute top-2 right-2 w-6 h-6 bg-background/80 hover:bg-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border'
                title='Remove from history'
            >
                <div className='w-3 h-3 text-alert'>
                    <CloseIcon />
                </div>
            </button>
        </div>
    )
}

function RemovedEntryPlaceholder() {
    return (
        <div className='flex snap-center'>
            <div className='w-48 h-64 flex items-center justify-center bg-border/20 rounded border-2 border-dashed border-border'>
                <div className='text-dimmed text-xs text-center px-4'>
                    <div>Removed from</div>
                    <div>reading history</div>
                </div>
            </div>
        </div>
    )
}