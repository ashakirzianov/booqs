'use client'

import { useState } from 'react'
import { BooqNote, NoteAuthorData } from '@/data/notes'
import { BooqId, BooqNode, BooqRange } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND } from '@/application/notes'
import { NoteCard } from './NoteCard'
import clsx from 'clsx'

type NotesFilterProps = {
    notes: BooqNote[]
    booqId: BooqId
    user: NoteAuthorData | undefined
    expandedFragments: Array<{ nodes: BooqNode[], range: BooqRange } | undefined>
}

export function NotesFilter({ notes, booqId, user, expandedFragments }: NotesFilterProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>('all')

    // Get all unique note kinds from the notes
    const availableKinds = Array.from(new Set(notes.map(note => note.kind)))
    const allKinds = [...HIGHLIGHT_KINDS, COMMENT_KIND]

    // Filter notes based on selected filter
    const filteredNotes = selectedFilter === 'all'
        ? notes
        : notes.filter(note => note.kind === selectedFilter)

    return (
        <>
            {/* Filter selector */}
            <div className="bg-background">
                <h3 className="flex text-sm font-medium text-dimmed mb-3">Show notes:</h3>
                <div className="flex flex-wrap justify-start items-center gap-2 py-2">
                    <FilterButton
                        active={selectedFilter === 'all'}
                        onClick={() => setSelectedFilter('all')}
                        label="All"
                        count={notes.length}
                    />
                    {allKinds.filter(kind => availableKinds.includes(kind)).map(kind => {
                        const count = notes.filter(note => note.kind === kind).length
                        return (
                            <FilterButton
                                key={kind}
                                active={selectedFilter === kind}
                                onClick={() => setSelectedFilter(kind)}
                                label={getKindLabel(kind)}
                                count={count}
                                color={`var(--color-${kind})`}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Notes list */}
            <div className="space-y-6">
                {filteredNotes.map((note) => {
                    const originalIndex = notes.findIndex(n => n.id === note.id)
                    return (
                        <NoteCard
                            key={note.id}
                            note={note}
                            booqId={booqId}
                            user={user}
                            expandedFragment={expandedFragments[originalIndex]}
                        />
                    )
                })}
            </div>
        </>
    )
}

function FilterButton({
    label,
    active,
    onClick,
    color
}: {
    active: boolean
    onClick: () => void
    label?: string
    count: number
    color?: string
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'flex shadow-md items-center justify-center text-xs font-medium transition-colors duration-200 border-2',
                {
                    'border-highlight': active,
                    'border-transparent': !active,
                    'w-8 h-8 rounded-full': color !== undefined,
                    'h-8 px-2 rounded': color === undefined,
                }
            )}
            style={{
                backgroundColor: color,
            }}
        >
            {color === undefined ? label : null}
        </button>
    )
}


function getKindLabel(kind: string): string {
    if (kind === COMMENT_KIND) {
        return 'Comments'
    }
    const highlightIndex = HIGHLIGHT_KINDS.indexOf(kind)
    if (highlightIndex !== -1) {
        return `Highlight ${highlightIndex + 1}`
    }
    return kind
}