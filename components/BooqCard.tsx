import Link from 'next/link'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { authorHref } from '@/application/href'
import { ReactNode } from 'react'

export type BooqCardData = {
    id: string,
    title: string | null,
    author: string | null,
    cover: string | null,
    tags: Array<{
        tag: string,
        value?: string | null,
    }>,
}
export function BooqCard({
    card: { title, author, cover, tags },
    actions,
}: {
    card: BooqCardData,
    actions?: ReactNode,
}) {
    return <div className="flex flex-col grow gap-4 items-center sm:flex-row sm:flex-wrap sm:items-stretch h-full">
        <BooqCover
            title={title}
            author={author}
            cover={cover}
        />
        <div className="flex flex-col flex-1 justify-between">
            <div className='header'>
                <Header title={title} author={author} />
            </div>
            <div className='mt-4'>
                <BooqTags tags={tags} />
            </div>
            <div className='mt-4 flex gap-2 self-stretch justify-end ml-xl'>
                {actions}
            </div>
        </div>
    </div>
}

function Header({ title, author }: {
    title: string | null,
    author: string | null,
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