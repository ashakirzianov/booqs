'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
            className={`flex items-start gap-3 p-2 rounded-lg transition-colors duration-200 border hover:border-highlight ${isSelected
                ? 'border-highlight'
                : 'border-dimmed'
                }`}
        >
            <BooqCover
                cover={card.cover}
                title={card.title}
                author={card.authors.join(', ')}
                size={60}
            />
            <div className="min-w-0 flex-1">
                <div className={`font-medium text-sm line-clamp-2 ${isSelected ? 'text-highlight' : 'text-primary'
                    }`}>
                    {card.title}
                </div>
                {card.authors.length > 0 && (
                    <div className={`text-xs mt-1 ${isSelected ? 'text-highlight' : 'text-dimmed'
                        }`}>
                        {card.authors.join(', ')}
                    </div>
                )}
            </div>
        </Link>
    )
}