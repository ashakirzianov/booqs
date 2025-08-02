import { ExploreSearch } from './ExploreSearch'
import { HistoryEntry } from './HistoryEntry'
import { getReadingHistoryForMainPage } from '@/data/history'
import styles from '@/app/(main)/MainLayout.module.css'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home() {
    const historyResult = await getReadingHistoryForMainPage({ limit: 1 })
    const hasHistory = historyResult && historyResult.entries.length > 0

    return <main className={styles.mainContent}>
        {hasHistory ? (
            <div className="mb-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Continue reading</h2>
                <div className="flex justify-center">
                    <HistoryEntry entry={historyResult.entries[0]} />
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-3xl font-bold mb-8 text-center">Explore collection</h2>
                <ExploreSearch />
            </div>
        )}
    </main>
}
