import { fetchBooqsWithOwnAnnotations } from '@/data/annotations'
import { booqCard, BooqCardData } from '@/data/booqs'
import { BooqId } from '@/core'
import { AnnotationsNavigationItem } from './AnnotationsNavigationItem'
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
    const uniqueBooqIds = await fetchBooqsWithOwnAnnotations()

    const booqsWithAnnotations = await Promise.all(
        uniqueBooqIds.map(async (booqId) => {
            const card = await booqCard(booqId)
            return card ? { booqId, card } : null
        })
    )

    const validBooqs = booqsWithAnnotations.filter(Boolean) as { booqId: BooqId, card: BooqCardData }[]

    return (
        <div className="p-4 h-full bg-background">
            {validBooqs.length === 0 ? (
                <p className="text-dimmed text-sm">No books with notes yet</p>
            ) : (
                <div className="space-y-3">
                    {validBooqs.map(({ booqId, card }) => (
                        <AnnotationsNavigationItem
                            key={booqId}
                            booqId={booqId}
                            card={card}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}