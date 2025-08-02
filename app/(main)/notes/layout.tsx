import { fetchBooqsWithOwnNotes } from '@/data/notes'
import { booqCard } from '@/data/booqs'
import Link from 'next/link'
import { BooqId } from '@/core'
import styles from '@/app/(main)/MainLayout.module.css'

export default async function NotesLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <>
            <main className={styles.mainContent}>
                {children}
            </main>
            <aside className={styles.rightPanel}>
                <NotesRightPanel />
            </aside>
        </>
    )
}

async function NotesRightPanel() {
    const uniqueBooqIds = await fetchBooqsWithOwnNotes()

    const booqsWithNotes = await Promise.all(
        uniqueBooqIds.map(async (booqId) => {
            const card = await booqCard(booqId)
            return card ? { booqId, card } : null
        })
    )

    const validBooqs = booqsWithNotes.filter(Boolean) as { booqId: BooqId, card: NonNullable<Awaited<ReturnType<typeof booqCard>>> }[]

    return (
        <div className="p-4 h-full bg-white">
            <h2 className="text-lg font-semibold text-primary mb-4">Books with Notes</h2>
            {validBooqs.length === 0 ? (
                <p className="text-dimmed text-sm">No books with notes yet</p>
            ) : (
                <div className="space-y-2">
                    {validBooqs.map(({ booqId, card }) => (
                        <Link
                            key={booqId}
                            href={`/notes/${booqId}`}
                            className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        >
                            <div className="font-medium text-primary text-sm line-clamp-2">
                                {card.title}
                            </div>
                            {card.authors.length > 0 && (
                                <div className="text-dimmed text-xs mt-1">
                                    {card.authors.join(', ')}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}