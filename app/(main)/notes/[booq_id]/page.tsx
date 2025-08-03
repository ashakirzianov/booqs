import { fetchNotes } from '@/data/notes'
import { parseId, type BooqId, comparePaths, isOverlapping } from '@/core'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { booqHref, authorHref } from '@/common/href'
import { getUserIdInsideRequest } from '@/data/request'
import { getCurrentUser } from '@/data/user'
import { booqCard, getExpandedFragments } from '@/data/booqs'
import { NotesFilter } from './NotesFilter'
import { ExpandedNoteFragmentData } from './NoteFragment'
import { Metadata } from 'next'

type Params = {
    booq_id: string,
}

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>,
}): Promise<Metadata> {
    const { booq_id } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        return {
            title: 'Notes Not Found - Booqs',
            description: 'The requested book notes could not be found.',
        }
    }
    const booqId: BooqId = `${library}-${id}`
    
    const bookData = await booqCard(booqId)
    if (!bookData) {
        return {
            title: 'Notes Not Found - Booqs',
            description: 'The requested book notes could not be found.',
        }
    }

    return {
        title: `Notes for ${bookData.title} - Booqs`,
        description: `View your notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
        openGraph: {
            title: `Notes for ${bookData.title}`,
            description: `View notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
            images: bookData.cover ? [bookData.cover.url] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: `Notes for ${bookData.title}`,
            description: `View notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
            images: bookData.cover ? [bookData.cover.url] : undefined,
        },
    }
}

export default async function NotesPage({ params }: {
    params: Promise<Params>,
}) {
    const { booq_id } = await params
    const [library, id] = parseId(booq_id as BooqId)
    if (!library || !id) {
        notFound()
    }
    const booqId: BooqId = `${library}-${id}`

    const userId = await getUserIdInsideRequest()
    if (!userId) {
        notFound()
    }

    const userNotes = await fetchNotes({ booqId, authorId: userId })
    const sortedNotes = userNotes.sort((a, b) => comparePaths(a.range.start, b.range.start))
    const currentUser = await getCurrentUser()
    const bookData = await booqCard(booqId)

    // Pre-load expanded fragments for all notes
    const noteRanges = sortedNotes.map(note => note.range)
    const expandedFragments = await getExpandedFragments(booqId, noteRanges)

    // Calculate overlapping notes for each expanded fragment
    const noteFragmentData: ExpandedNoteFragmentData[] = expandedFragments.map((fragment, index) => {
        const note = sortedNotes[index]
        if (!note || !fragment) return undefined
        if (!fragment) return {
            note: sortedNotes[index],
            overlapping: [],
            nodes: undefined,
            range: note.range,
        }

        // Find all notes that overlap with the expanded range
        const overlapping = sortedNotes.filter((note, noteIndex) => {
            // Don't include the note itself
            if (noteIndex === index) return false

            // Check if the note's range overlaps with the expanded range
            return isOverlapping(note.range, fragment.range)
        })
        return {
            note: sortedNotes[index],
            overlapping,
            nodes: fragment.nodes,
            range: fragment.range,
        }
    }).filter(datum => datum !== undefined)

    if (!bookData) {
        notFound()
    }

    return (
        <main className="flex flex-row justify-center min-h-screen bg-background">
            <div className="flex flex-col max-w-4xl w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Notes for{' '}
                        <Link
                            href={booqHref({ booqId, path: [0] })}
                            className="hover:text-highlight hover:underline"
                        >
                            {bookData.title}
                        </Link>
                        {' '}by{' '}
                        {bookData.authors.map((author, index) => (
                            <span key={author}>
                                <Link
                                    href={authorHref({ name: author, libraryId: library })}
                                    className="hover:text-highlight hover:underline"
                                >
                                    {author}
                                </Link>
                                {index < bookData.authors.length - 1 && ', '}
                            </span>
                        ))}
                    </h1>
                </div>

                {userNotes.length === 0 ? (
                    <div className="text-center">
                        <p className="text-dimmed text-lg mb-4">No notes yet</p>
                        <p className="text-dimmed mb-6">Start reading and add notes to see them here</p>
                        <Link
                            href={booqHref({ booqId, path: [0] })}
                            className="bg-action hover:bg-highlight text-light px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Start Reading
                        </Link>
                    </div>
                ) : (
                    <NotesFilter
                        data={noteFragmentData}
                        booqId={booqId}
                        user={currentUser ? {
                            id: currentUser.id,
                            username: currentUser.username,
                            name: currentUser.name,
                            emoji: currentUser.emoji,
                            profilePictureURL: currentUser.profilePictureURL,
                        } : undefined}
                    />
                )}
            </div>
        </main>
    )
}

