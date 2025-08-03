'use client'

import { useState } from 'react'
import { NoteAuthorData } from '@/data/notes'
import { BooqId } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND } from '@/application/notes'
import { NoteCard } from './NoteCard'
import clsx from 'clsx'
import { ExpandedNoteFragmentData } from './NoteFragment'

type NotesFilterProps = {
    data: ExpandedNoteFragmentData[]
    booqId: BooqId
    user: NoteAuthorData | undefined
}

export function NotesFilter({ data, user }: NotesFilterProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>('all')

    // Get all unique note kinds from the notes
    const availableKinds = Array.from(new Set(data.map(datum => datum.note.kind)))
    const allKinds = [...HIGHLIGHT_KINDS, COMMENT_KIND]

    // Filter notes based on selected filter
    const filteredNotes = selectedFilter === 'all'
        ? data
        : data.filter(datum => datum.note.kind === selectedFilter)

    return (
        <>
            {/* Filter selector */}
            <div className="bg-background">
                <h3 className="flex text-sm font-medium text-dimmed mb-3">Show notes:</h3>
                <div className='h-10 my-3 shadow-md rounded overflow-clip' style={{
                    width: `calc(var(--spacing) * ${(allKinds.length + 1) * 7})`,
                }}>
                    <div className="flex flex-row h-full items-stretch justify-between">
                        <FilterButton
                            active={selectedFilter === 'all'}
                            onClick={() => setSelectedFilter('all')}
                            label="All"
                            count={data.length}
                        />
                        {allKinds.filter(kind => availableKinds.includes(kind)).map(kind => {
                            const count = data.filter(datum => datum.note.kind === kind).length
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
            </div>

            {/* Notes list */}
            <div className="space-y-6">
                {filteredNotes.map((datum) => {
                    return (
                        <NoteCard
                            key={datum.note.id}
                            noteFragmentData={datum}
                            user={user}
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
                'flex items-center justify-center text-xs font-medium transition-colors duration-200 border-b-5 h-full w-full'
            )}
            style={{
                backgroundColor: color,
                borderColor: active ? `hsl(from ${color ?? 'var(--color-primary)'} h s l / 100%)` : 'transparent',
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