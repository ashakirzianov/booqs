import { fetchNotes } from '@/data/notes'
import { parseIdOpt, type BooqId, comparePaths } from '@/core'
import { notFound, redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import Link from 'next/link'
import { booqContentHref, authorHref, booqImageUrl } from '@/common/href'
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
    const [library, id] = parseIdOpt(booq_id) ?? [null, null]
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

    const images = bookData.coverSrc
        ? [booqImageUrl({ booqId, imageId: bookData.coverSrc, width: 360 })]
        : undefined

    return {
        title: `Notes for ${bookData.title} - Booqs`,
        description: `View your notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
        openGraph: {
            title: `Notes for ${bookData.title}`,
            description: `View notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title: `Notes for ${bookData.title}`,
            description: `View notes and annotations for "${bookData.title}"${bookData.authors.length > 0 ? ` by ${bookData.authors.join(', ')}` : ''}.`,
            images,
        },
    }
}

export default async function NotesPage({ params }: {
    params: Promise<Params>,
}) {
    const { booq_id } = await params
    const [library, id] = parseIdOpt(booq_id) ?? [null, null]
    if (!library || !id) {
        notFound()
    }
    const booqId: BooqId = `${library}-${id}`

    const userId = await getUserIdInsideRequest()
    if (!userId) {
        redirect(authHref({}))
    }

    const userNotes = await fetchNotes({ booqId, authorId: userId })
    const sortedNotes = userNotes.sort((a, b) => comparePaths(a.range.start, b.range.start))
    const currentUser = await getCurrentUser()
    const bookData = await booqCard(booqId)

    // Pre-load expanded fragments for all notes
    const noteRanges = sortedNotes.map(note => note.range)
    const expandedFragments = await getExpandedFragments(booqId, noteRanges)

    const noteFragmentData: ExpandedNoteFragmentData[] = expandedFragments.map((fragment, index) => {
        const note = sortedNotes[index]
        if (!note) return undefined
        return {
            note,
            nodes: fragment?.nodes,
            styles: fragment?.styles,
            range: fragment?.range ?? note.range,
        }
    }).filter(datum => datum !== undefined)

    if (!bookData) {
        notFound()
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-primary mb-2">
                    <Link
                        href={booqContentHref({ booqId, path: [0] })}
                        className="hover:text-highlight hover:underline"
                    >
                        {bookData.title}
                    </Link>
                    {bookData.authors.length > 0 && (
                        <>
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
                        </>
                    )}
                </h1>
            </div>

            {userNotes.length === 0 ? (
                <div className="text-center">
                    <p className="text-dimmed text-lg mb-4">No notes yet</p>
                    <p className="text-dimmed mb-6">Start reading and add notes to see them here</p>
                    <Link
                        href={booqContentHref({ booqId, path: [0] })}
                        className="bg-action hover:bg-highlight text-light px-6 py-3 rounded-lg transition-colors duration-200"
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
        </>
    )
}

