'use client'

import { useState } from 'react'
import { booqHref } from '@/common/href'
import { BooqCover } from '@/components/BooqCover'
import { TrashIcon } from '@/components/Icons'
import { IconButton } from '@/components/Buttons'
import { removeHistoryEntryAction, BriefReadingHistoryEntry } from '@/data/history'

export function HistoryEntry({
    entry
}: {
    entry: BriefReadingHistoryEntry
}) {
    const [isRemoving, setIsRemoving] = useState(false)
    const [isRemoved, setIsRemoved] = useState(false)
    const { booqId, cover, title, authors, lastRead } = entry

    async function handleRemove() {
        if (isRemoving || isRemoved) return

        setIsRemoving(true)
        try {
            const result = await removeHistoryEntryAction({ booqId })
            if (result.success) {
                setIsRemoved(true)
            } else {
                console.error('Failed to remove history entry:', result.error)
                setIsRemoving(false)
            }
        } catch (error) {
            console.error('Failed to remove history entry:', error)
            setIsRemoving(false)
        }
    }

    if (isRemoved) {
        return (
            <div className="border border-dimmed rounded-lg p-4 bg-secondary/50 opacity-75">
                <div className="flex items-center justify-center py-8 text-dimmed">
                    <p className="text-sm">This booq was removed from the reading history</p>
                </div>
            </div>
        )
    }

    return (
        <div className="border shadow-sm rounded-lg p-4 hover:bg-secondary transition-colors">
            <div className="flex items-start gap-4">
                <BooqCover
                    cover={cover}
                    title={title}
                    author={authors?.join(', ')}
                    size={50}
                />
                <div className="flex-1 min-w-0">
                    <a
                        href={booqHref({ booqId })}
                        className="block hover:text-action transition-colors"
                    >
                        <h3 className="font-medium text-lg truncate">{title}</h3>
                    </a>
                    {(authors?.length ?? 0) > 0 && (
                        <div className="text-dimmed text-sm">
                            by {authors?.map((author, idx) => (
                                <span key={idx}>
                                    <a href={booqHref({ booqId })} className="hover:text-action transition-colors">
                                        {author}
                                    </a>
                                    {idx < (authors?.length ?? 0) - 1 && ', '}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="mt-2 text-xs text-dimmed">
                        Last read: {new Date(lastRead).toLocaleDateString()}
                    </div>
                    <a
                        href={booqHref({ booqId, path: entry.path })}
                        className="inline-block mt-2 text-action hover:text-highlight text-sm font-medium"
                    >
                        Continue Reading
                    </a>
                </div>
                <IconButton
                    onClick={handleRemove}
                    disabled={isRemoving}
                    variant="danger"
                    title="Remove from history"
                    className="flex-shrink-0"
                >
                    <div className="w-4 h-4">
                        {isRemoving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-alert"></div>
                        ) : (
                            <TrashIcon />
                        )}
                    </div>
                </IconButton>
            </div>
        </div>
    )
}