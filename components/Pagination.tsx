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
        <div className="flex items-center justify-between mt-8 px-4">
            <div className="flex items-center space-x-4">
                {hasPrevious && (
                    <Link 
                        href={`${baseUrl}?page=${currentPage - 1}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                    >
                        Previous
                    </Link>
                )}
                {!hasPrevious && (
                    <div className="px-4 py-2 text-dimmed">Previous</div>
                )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-dimmed">
                <span>Page {currentPage}</span>
                {totalPages && <span>of {totalPages}</span>}
                {total && <span>({total} total)</span>}
            </div>
            
            <div className="flex items-center space-x-4">
                {hasMore && (
                    <Link 
                        href={`${baseUrl}?page=${currentPage + 1}`}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                    >
                        Next
                    </Link>
                )}
                {!hasMore && (
                    <div className="px-4 py-2 text-dimmed">Next</div>
                )}
            </div>
        </div>
    )
}