import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { getReadingHistoryForHistoryList } from '@/data/history'
import { Pagination } from '@/app/(main)/Pagination'
import { HistoryEntry } from './HistoryEntry'
import styles from '@/app/(main)/MainLayout.module.css'

const PAGE_SIZE = 20

export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: pageParam } = await searchParams
    const currentPage = Math.max(1, parseInt(pageParam || '1', 10))
    const offset = (currentPage - 1) * PAGE_SIZE

    const result = await getReadingHistoryForHistoryList({
        limit: PAGE_SIZE,
        offset,
    })

    if (!result) {
        redirect(authHref({}))
    }

    if (result.entries.length === 0 && currentPage === 1) {
        return (
            <main className={styles.mainContent}>
                <div className="text-center text-dimmed py-8">
                    <p>No reading history yet. Start reading to see your history here!</p>
                </div>
            </main>
        )
    }

    const baseUrl = '/account/history'

    return (
        <main className={styles.mainContent}>
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold mb-6">Reading History</h1>
                <div className="space-y-3">
                    {result.entries.map((entry, index) => (
                        <HistoryEntry
                            key={`${entry.booqId}:${index}`}
                            entry={entry}
                        />
                    ))}
                </div>
                {result.total > PAGE_SIZE && (
                    <Pagination
                        currentPage={currentPage}
                        hasMore={result.hasMore}
                        total={result.total}
                        baseUrl={baseUrl}
                        pageSize={PAGE_SIZE}
                    />
                )}
            </div>
        </main>
    )
}