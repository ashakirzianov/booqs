import { redirect } from 'next/navigation'
import { authHref, booqHref } from '@/common/href'
import { getReadingHistory } from '@/data/history'
import { BooqCover } from '@/components/BooqCover'

export default async function HistoryPage() {
    const history = await getReadingHistory()
    if (!history) {
        redirect(authHref({}))
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center text-dimmed py-8">
                <p>No reading history yet. Start reading to see your history here!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Reading History</h1>
            <div className="space-y-3">
                {history.map(({ booqId, coverSrc, title, authors, lastRead }, index) => (
                    <div key={index} className="border border-dimmed rounded-lg p-4 hover:bg-secondary transition-colors">
                        <div className="flex items-start gap-4">
                            <BooqCover
                                booqId={booqId}
                                coverSrc={coverSrc}
                                title={title}
                                author={authors?.join(', ')}
                                size={50}
                            />
                            <div className="flex-1 min-w-0">
                                <a
                                    href={booqHref({ booqId })}
                                    className="block hover:text-primary transition-colors"
                                >
                                    <h3 className="font-medium text-lg truncate">{title}</h3>
                                    {(authors?.length ?? 0) > 0 && (
                                        <p className="text-dimmed text-sm">by {authors?.join(', ')}</p>
                                    )}
                                </a>
                                <div className="mt-2 text-xs text-dimmed">
                                    Last read: {new Date(lastRead).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}