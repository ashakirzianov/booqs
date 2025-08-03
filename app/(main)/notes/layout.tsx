import { fetchBooqsWithOwnNotes } from '@/data/notes'
import { booqCard, BooqCardData } from '@/data/booqs'
import Link from 'next/link'
import { BooqId } from '@/core'
import { BooqCover } from '@/components/BooqCover'
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
            const card = await booqCard(booqId, 120)
            return card ? { booqId, card } : null
        })
    )

    const validBooqs = booqsWithNotes.filter(Boolean) as { booqId: BooqId, card: BooqCardData }[]

    return (
        <div className="p-4 h-full bg-white">
            <h2 className="text-lg font-semibold text-primary mb-4">Books with Notes</h2>
            {validBooqs.length === 0 ? (
                <p className="text-dimmed text-sm">No books with notes yet</p>
            ) : (
                <div className="space-y-3">
                    {validBooqs.map(({ booqId, card }) => (
                        <Link
                            key={booqId}
                            href={`/notes/${booqId}`}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <BooqCover
                                cover={card.cover}
                                title={card.title}
                                author={card.authors.join(', ')}
                                size={24}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-primary text-sm line-clamp-2">
                                    {card.title}
                                </div>
                                {card.authors.length > 0 && (
                                    <div className="text-dimmed text-xs mt-1">
                                        {card.authors.join(', ')}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}