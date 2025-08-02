import { fetchNotes } from '@/data/notes'
import { BooqNote } from '@/data/notes'
import { parseId, type BooqId } from '@/core'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { booqHref } from '@/common/href'
import { getUserIdInsideRequest } from '@/data/request'

type Params = {
    booq_id: string,
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

    return (
        <main className="flex flex-row justify-center min-h-screen bg-background">
            <div className="flex flex-col max-w-4xl w-full p-6">
                <div className="mb-6">
                    <Link
                        href={booqHref({ booqId, path: [0] })}
                        className="text-action hover:text-highlight hover:underline mb-4 inline-block"
                    >
                        ← Back to Book
                    </Link>
                    <h1 className="text-3xl font-bold text-primary mb-2">My Notes</h1>
                    <p className="text-dimmed">Your notes for this book</p>
                </div>

                {userNotes.length === 0 ? (
                    <div className="text-center py-12">
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
                    <div className="space-y-6">
                        {userNotes.map((note) => (
                            <NoteCard key={note.id} note={note} booqId={booqId} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

function NoteCard({ note, booqId }: { note: BooqNote, booqId: BooqId }) {
    return (
        <div className="bg-white p-6 transition-shadow duration-200">
            <div className="mb-4">
                <div className='rounded shadow-sm p-3'>
                    <span className="italic text-primary m-0" style={{
                        backgroundColor: `var(--color-${note.kind})`,
                    }}>
                        {note.targetQuote}
                    </span>
                </div>
                {note.content && (
                    <div className="text-primary mt-4 p-3">
                        {note.content}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-sm pt-4">

                <Link
                    href={booqHref({ booqId, path: note.range.start })}
                    className=" hover:text-highlight hover:underline text-action px-4 py-2 rounded font-medium transition-colors duration-200"
                >
                    Show in booq
                </Link>
            </div>
        </div>
    )
}