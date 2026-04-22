'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { BooqId } from '@/core'
import { BooqCover } from '@/components/BooqCover'
import { BooqCardData } from '@/data/booqs'

interface NotesNavigationItemProps {
    booqId: BooqId
    card: BooqCardData
}

export function NotesNavigationItem({ booqId, card }: NotesNavigationItemProps) {
    const pathname = usePathname()
    const isSelected = pathname === `/notes/${booqId}`

    return (
        <Link
            href={`/notes/${booqId}`}
            className={clsx(
                'flex items-start gap-3 p-2 rounded-lg transition-colors duration-200 hover:opacity-80',
                isSelected && 'border border-highlight',
            )}
        >
            <BooqCover
                booqId={booqId}
                coverSrc={card.coverSrc}
                title={card.title}
                author={card.authors.join(', ')}
                size={60}
            />
            <div className="hidden large:block min-w-0 flex-1">
                <div className={clsx('text-md line-clamp-2', isSelected ? 'text-highlight' : 'text-dimmed')}>
                    {card.title}
                </div>
                {card.authors.length > 0 && (
                    <div className="text-sm mt-1 text-dimmed">
                        {card.authors.join(', ')}
                    </div>
                )}
            </div>
        </Link>
    )
}