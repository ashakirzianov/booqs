'use client'

import { useState, useMemo } from 'react'
import { NoteAuthorData } from '@/data/notes'
import { BooqId } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND, QUESTION_KIND, useBooqNotes } from '@/application/notes'
import { NoteCard } from './NoteCard'
import clsx from 'clsx'
import { ExpandedNoteFragmentData } from './NoteFragment'

export function NotesFilter({ data, booqId, user }: {
    data: ExpandedNoteFragmentData[],
    booqId: BooqId,
    user: NoteAuthorData | undefined,
}) {
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

    // Build filter groups in canonical order: highlights 0–4, then comments (merged comment+question)
    const filterGroups = useMemo(() => {
        const presentKinds = new Set(mergedData.map(datum => datum.note.kind))
        const groups: { key: string, label: string, color?: string, match: (kind: string) => boolean }[] = []
        for (const kind of HIGHLIGHT_KINDS) {
            if (presentKinds.has(kind)) {
                groups.push({
                    key: kind,
                    label: getKindLabel(kind),
                    color: `var(--color-${kind})`,
                    match: (k) => k === kind,
                })
            }
        }
        const hasComments = presentKinds.has(COMMENT_KIND) || presentKinds.has(QUESTION_KIND)
        if (hasComments) {
            groups.push({
                key: 'comments',
                label: 'Comments',
                match: isCommentOrQuestion,
            })
        }
        return groups
    }, [mergedData])

    // Handle note color changes and adjust filter if necessary
    function handleNoteColorChange(noteId: string, newKind: string) {
        if (selectedFilter === 'all') return
        const currentGroup = filterGroups.find(g => g.key === selectedFilter)
        if (currentGroup && !currentGroup.match(newKind)) {
            const newGroup = filterGroups.find(g => g.match(newKind))
            setSelectedFilter(newGroup?.key ?? 'all')
        }
    }

    // Filter notes based on selected filter
    const activeGroup = filterGroups.find(g => g.key === selectedFilter)
    const filteredNotes = selectedFilter === 'all'
        ? mergedData
        : mergedData.filter(datum => activeGroup?.match(datum.note.kind))

    return (
        <>
            {/* Filter selector */}
            <div className="bg-background flex flex-row items-center gap-3 my-3">
                <h3 className="text-md font-medium text-dimmed whitespace-nowrap">Show notes:</h3>
                <div className='h-10 shadow-md rounded overflow-clip' style={{
                    width: `calc(var(--spacing) * ${(filterGroups.length + 1) * 10})`,
                }}>
                    <div className="flex flex-row h-full items-stretch justify-between">
                        <FilterButton
                            active={selectedFilter === 'all'}
                            onClick={() => setSelectedFilter('all')}
                            label="All"
                            count={mergedData.length}
                        />
                        {filterGroups.map(group => {
                            const count = mergedData.filter(datum => group.match(datum.note.kind)).length
                            return (
                                <FilterButton
                                    key={group.key}
                                    active={selectedFilter === group.key}
                                    onClick={() => setSelectedFilter(group.key)}
                                    label={group.label}
                                    count={count}
                                    color={group.color}
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
    if (isCommentOrQuestion(kind)) {
        return 'Comments'
    }
    const highlightIndex = HIGHLIGHT_KINDS.indexOf(kind)
    if (highlightIndex !== -1) {
        return `Highlight ${highlightIndex + 1}`
    }
    return kind
}

function isCommentOrQuestion(kind: string): boolean {
    return kind === COMMENT_KIND || kind === QUESTION_KIND
}