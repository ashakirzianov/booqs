'use client'

import { useState, useMemo } from 'react'
import { NoteAuthorData } from '@/data/notes'
import { BooqId } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND, useBooqNotes } from '@/application/notes'
import { NoteCard } from './NoteCard'
import clsx from 'clsx'
import { ExpandedNoteFragmentData } from './NoteFragment'

type NotesFilterProps = {
    data: ExpandedNoteFragmentData[]
    booqId: BooqId
    user: NoteAuthorData | undefined
}

export function NotesFilter({ data, booqId, user }: NotesFilterProps) {
    const initialNotes = useMemo(() => {
        return data.map(datum => datum.note)
    }, [data])
    const { notes: currentNotes } = useBooqNotes({
        booqId,
        user,
        initialNotes,
    })

    // Merge current notes with initial data, preferring current notes for updates
    const mergedData = useMemo(() => {
        return data.map(datum => {
            const currentNote = currentNotes.find(n => n.id === datum.note.id)
            // Also update overlapping notes with current data
            const updatedOverlapping = datum.overlapping.map(overlappingNote => {
                return currentNotes.find(n => n.id === overlappingNote.id)
            }).filter(overlappingNote => {
                // Only include overlapping notes that still exist
                return overlappingNote !== undefined
            })

            return {
                ...datum,
                note: currentNote ?? datum.note,
                overlapping: updatedOverlapping
            }
        })
    }, [data, currentNotes])
    const [selectedFilter, setSelectedFilter] = useState<string>('all')

    const allKinds = Array.from(new Set(mergedData.map(datum => datum.note.kind)))

    // Handle note color changes and adjust filter if necessary
    function handleNoteColorChange(noteId: string, newKind: string) {
        // If current filter is not 'all' and the note would be filtered out,
        // switch to the new color filter to keep the note visible
        if (selectedFilter !== 'all' && selectedFilter !== newKind) {
            setSelectedFilter(newKind)
        }
    }

    // Filter notes based on selected filter
    const filteredNotes = selectedFilter === 'all'
        ? mergedData
        : mergedData.filter(datum => datum.note.kind === selectedFilter)

    return (
        <>
            {/* Filter selector */}
            <div className="bg-background">
                <h3 className="flex text-sm font-medium text-dimmed mb-3">Show notes:</h3>
                <div className='h-10 my-3 shadow-md rounded overflow-clip' style={{
                    width: `calc(var(--spacing) * ${(allKinds.length + 1) * 10})`,
                }}>
                    <div className="flex flex-row h-full items-stretch justify-between">
                        <FilterButton
                            active={selectedFilter === 'all'}
                            onClick={() => setSelectedFilter('all')}
                            label="All"
                            count={mergedData.length}
                        />
                        {allKinds.map(kind => {
                            const count = mergedData.filter(datum => datum.note.kind === kind).length
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
                {filteredNotes.length > 0 ? filteredNotes.map((datum) => {
                    return (
                        <NoteCard
                            key={datum.note.id}
                            noteFragmentData={datum}
                            user={user}
                            onColorChange={handleNoteColorChange}
                        />
                    )
                }) : (
                    <div className="text-center text-dimmed">
                        No notes of selected color.
                    </div>
                )}
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