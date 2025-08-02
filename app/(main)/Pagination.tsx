import { ActionButton } from '@/components/Buttons'
import { BackIcon, ForwardIcon } from '@/components/Icons'
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
                    >
                        <ActionButton
                            text="Previous"
                            icon={<BackIcon />}
                            variant="secondary"
                        />
                    </Link>
                ) : (
                    <ActionButton
                        text="Previous"
                        icon={<BackIcon />}
                        variant="secondary"
                        disabled
                    />
                )}

                <div className="flex items-center space-x-2 text-sm">
                    <span>Page {currentPage}</span>
                    {totalPages && <span className="text-dimmed">of {totalPages}</span>}
                    {total && <span className="text-dimmed">({total} total)</span>}
                </div>

                {hasMore ? (
                    <Link
                        href={`${baseUrl}?page=${currentPage + 1}`}
                    >
                        <ActionButton
                            text="Next"
                            icon={<ForwardIcon />}
                            variant="secondary"
                        />
                    </Link>
                ) : (
                    <ActionButton
                        text="Next"
                        icon={<ForwardIcon />}
                        variant="secondary"
                        disabled
                    />
                )}
            </div>
        </div>
    )
}