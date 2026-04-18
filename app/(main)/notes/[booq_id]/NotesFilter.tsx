'use client'

import { useState, useMemo } from 'react'
import { NoteAuthorData } from '@/data/notes'
import { BooqId } from '@/core'
import { HIGHLIGHT_KINDS, COMMENT_KIND, QUESTION_KIND, useBooqNotes } from '@/application/notes'
import { NoteCard } from './NoteCard'
import clsx from 'clsx'
import { ExpandedNoteFragmentData } from './NoteFragment'
import { CommentIcon } from '@/components/Icons'
import { LightButton } from '@/components/Buttons'

type FilterGroup = {
    key: string,
    label: string,
    color?: string,
    icon?: React.ReactNode,
}

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

    const [selectedFilter, setSelectedFilter] = useState<string>('all')
    const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

    // Merge server data with SWR-updated notes
    const mergedNoteData = useMemo(() => {
        return data.map(datum => {
            const currentNote = currentNotes.find(n => n.id === datum.note.id)
            return {
                ...datum,
                note: currentNote ?? datum.note,
            }
        })
    }, [data, currentNotes])

    // Build filter groups in canonical order
    const filterGroups = useMemo(() => {
        const presentKinds = new Set(mergedNoteData.map(d => d.note.kind))
        const filterGroups: FilterGroup[] = []
        for (const kind of HIGHLIGHT_KINDS) {
            if (presentKinds.has(kind)) {
                filterGroups.push({
                    key: kind,
                    label: `Highlight ${HIGHLIGHT_KINDS.indexOf(kind) + 1}`,
                    color: `var(--color-${kind})`,
                })
            }
        }
        if (presentKinds.has(COMMENT_KIND) || presentKinds.has(QUESTION_KIND)) {
            filterGroups.push({
                key: 'comments',
                label: 'Comments',
                icon: <CommentIcon />,
            })
        }

        return filterGroups
    }, [mergedNoteData])

    const filteredNotes = useMemo(() => selectedFilter === 'all'
        ? mergedNoteData
        : mergedNoteData.filter(d => filterKeyForKind(d.note.kind) === selectedFilter), [mergedNoteData, selectedFilter])

    const hasAnyExpanded = filteredNotes.some(d => expandedNotes.has(d.note.id))

    function handleToggleAll() {
        if (hasAnyExpanded) {
            setExpandedNotes(new Set())
        } else {
            setExpandedNotes(new Set(filteredNotes.map(d => d.note.id)))
        }
    }

    function handleToggleNote(noteId: string) {
        setExpandedNotes(prev => {
            const next = new Set(prev)
            if (next.has(noteId)) {
                next.delete(noteId)
            } else {
                next.add(noteId)
            }
            return next
        })
    }

    function handleNoteColorChange(_noteId: string, newKind: string) {
        if (selectedFilter === 'all') return
        if (filterKeyForKind(newKind) !== selectedFilter) {
            setSelectedFilter(filterKeyForKind(newKind))
        }
    }

    return (
        <>
            {/* Notes controls row */}
            <div className="bg-background flex flex-row justify-between">
                <div className='flex flex-row items-center gap-3 my-3'>
                    <h3 className="text-md text-dimmed whitespace-nowrap font-medium">Show notes:</h3>
                    <div className='h-10 shadow-md rounded overflow-clip' style={{
                        width: `calc(var(--spacing) * ${(filterGroups.length + 1) * 10})`,
                    }}>
                        <div className="flex flex-row h-full items-stretch justify-between">
                            <FilterButton
                                active={selectedFilter === 'all'}
                                onClick={() => setSelectedFilter('all')}
                                label="All"
                            />
                            {filterGroups.map(group => (
                                <FilterButton
                                    key={group.key}
                                    active={selectedFilter === group.key}
                                    onClick={() => setSelectedFilter(group.key)}
                                    label={group.label}
                                    color={group.color}
                                    icon={group.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <LightButton
                    text={hasAnyExpanded ? 'Collapse All' : 'Expand All'}
                    onClick={handleToggleAll}
                />
            </div>

            {/* Notes list */}
            <div className="space-y-6">
                {filteredNotes.length > 0 ? filteredNotes.map((datum) => (
                    <NoteCard
                        key={datum.note.id}
                        noteFragmentData={datum}
                        user={user}
                        isExpanded={expandedNotes.has(datum.note.id)}
                        onToggle={() => handleToggleNote(datum.note.id)}
                        onColorChange={handleNoteColorChange}
                    />
                )) : (
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
    color,
    icon,
}: {
    active: boolean,
    onClick: () => void,
    label: string,
    color?: string,
    icon?: React.ReactNode,
}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={clsx(
                'flex items-center justify-center text-xs font-medium transition-colors duration-200 border-b-5 h-full w-full',
                !color && !icon && 'text-dimmed',
                icon && 'text-dimmed',
            )}
            style={{
                backgroundColor: color,
                borderColor: active ? `hsl(from ${color ?? 'var(--color-dimmed)'} h s l / 100%)` : 'transparent',
            }}
        >
            {icon ? <div className="w-5 h-5">{icon}</div>
                : color === undefined ? label : null}
        </button>
    )
}

function filterKeyForKind(kind: string): string {
    if (kind === COMMENT_KIND || kind === QUESTION_KIND) {
        return 'comments'
    }
    return kind
}
