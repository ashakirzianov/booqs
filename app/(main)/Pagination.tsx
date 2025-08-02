import Link from 'next/link'

type PaginationProps = {
    currentPage: number
    hasMore: boolean
    total?: number
    baseUrl: string
    pageSize: number
}

export function Pagination({ currentPage, hasMore, total, baseUrl, pageSize }: PaginationProps) {
    const hasPrevious = currentPage > 1
    const totalPages = total ? Math.ceil(total / pageSize) : undefined
    
    return (
        <div className="flex items-center justify-center mt-8 px-4">
            <div className="flex items-center space-x-6">
                {hasPrevious ? (
                    <Link 
                        href={`${baseUrl}?page=${currentPage - 1}`}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                    >
                        Previous
                    </Link>
                ) : (
                    <div className="px-4 py-2 text-dimmed cursor-not-allowed">Previous</div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                    <span>Page {currentPage}</span>
                    {totalPages && <span className="text-dimmed">of {totalPages}</span>}
                    {total && <span className="text-dimmed">({total} total)</span>}
                </div>
                
                {hasMore ? (
                    <Link 
                        href={`${baseUrl}?page=${currentPage + 1}`}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                    >
                        Next
                    </Link>
                ) : (
                    <div className="px-4 py-2 text-dimmed cursor-not-allowed">Next</div>
                )}
            </div>
        </div>
    )
}