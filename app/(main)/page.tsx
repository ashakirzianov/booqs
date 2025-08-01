import { HistoryEntry } from './HistoryEntry'
import { getReadingHistoryForMainPage } from '@/data/history'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Home() {
    const historyResult = await getReadingHistoryForMainPage({ limit: 1 })
    
    return <>
        {historyResult && historyResult.entries.length > 0 && (
            <div className="mb-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Continue reading</h2>
                <HistoryEntry entry={historyResult.entries[0]} />
            </div>
        )}
    </>
}
