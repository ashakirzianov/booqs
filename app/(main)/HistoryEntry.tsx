'use client'

import React, { useState } from 'react'
import { BooqCover } from '@/components/BooqCover'
import { CloseIcon } from '@/components/Icons'
import { pageForPosition } from '@/application/common'
import Link from 'next/link'
import { DetailedReadingHistoryEntry, BriefReadingHistoryEntry, ReadingHistoryEntry, removeHistoryEntryAction } from '@/data/history'
import { BooqPath } from '@/core'
import { booqHref } from '@/common/href'

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
            {false && <button
                onClick={onRemove}
                className='absolute top-2 right-2 w-6 h-6 bg-background/80 hover:bg-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border'
                title='Remove from history'
            >
                <div className='w-3 h-3 text-alert'>
                    <CloseIcon />
                </div>
            </button>}
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

function BooqPreview({
    text,
    title,
    page,
}: {
    path: BooqPath,
    text: string,
    title: string,
    page: number,
    total: number,
}) {
    return (
        <div className="flex flex-col grow shrink-0 basis-auto w-[90vw] rounded-sm items-center font-book text-lg cursor-pointer px-8 p-4 max-w-[400px] border border-gray-300 shadow-md transition-shadow hover:shadow-lg">
            <span className="truncate text-dimmed dark:text-dark-dimmed text-center w-full p-1">{title}</span>
            <div className="text-justify text-gray-700 text-sm my-4 line-clamp-6">{text}</div>
            <div className="text-dimmed dark:text-dark-dimmed">{page}</div>
        </div>
    )
}