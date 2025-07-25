import Link from 'next/link'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { authorHref, booqHref } from '@/core/href'
import { ReactNode } from 'react'
import { BooqDetails } from '@/data/booqs'

export function BooqCard({
    card: { booqId, title, authors, coverSrc, tags },
    actions,
}: {
    card: BooqDetails,
    actions?: ReactNode,
}) {
    const author = authors?.join(', ')
    const bookUrl = booqHref({ booqId })
    return <div className="flex flex-col grow gap-4 items-center sm:flex-row sm:flex-wrap sm:items-stretch h-full">
        <Link href={bookUrl}>
            <BooqCover
                booqId={booqId}
                title={title ?? undefined}
                author={author}
                coverSrc={coverSrc}
            />
        </Link>
        <div className="flex flex-col flex-1 justify-between">
            <div className='header'>
                <Header title={title} author={author} bookUrl={bookUrl} />
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

function Header({ title, author, bookUrl }: {
    title: string | undefined,
    author: string | undefined,
    bookUrl: string,
}) {
    return <div className='flex flex-col items-baseline'>
        <Link href={bookUrl} className="text-xl font-bold hover:underline">
            {title}
        </Link>
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