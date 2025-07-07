import Link from 'next/link'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { authorHref } from '@/application/href'
import { ReactNode } from 'react'
import { BooqDetails } from '@/data/booqs'

export function BooqCard({
    card: { title, authors, coverUrl, tags },
    actions,
}: {
    card: BooqDetails,
    actions?: ReactNode,
}) {
    const author = authors?.join(', ')
    return <div className="flex flex-col grow gap-4 items-center sm:flex-row sm:flex-wrap sm:items-stretch h-full">
        <BooqCover
            title={title ?? undefined}
            author={author}
            coverUrl={coverUrl}
        />
        <div className="flex flex-col flex-1 justify-between">
            <div className='header'>
                <Header title={title} author={author} />
            </div>
            <div className='mt-4'>
                <BooqTags tags={tags ?? []} />
            </div>
            <div className='mt-4 flex gap-2 self-stretch justify-end ml-xl'>
                {actions}
            </div>
        </div>
    </div>
}

function Header({ title, author }: {
    title: string | undefined,
    author: string | undefined,
}) {
    return <div className='flex flex-col items-baseline'>
        <span className="text-xl font-bold">{title}</span>
        {
            author &&
            <span className="text-lg">by <Link href={authorHref({ name: author })}
                className='hover:underline'
            >
                {author}
            </Link></span>
        }
    </div>
}