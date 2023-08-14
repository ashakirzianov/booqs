import Link from 'next/link'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { authorHref, booqHref } from '@/components/Links'

export type BooqCardData = {
    id: string,
    title?: string,
    author?: string,
    cover?: string,
    tags: Array<{
        tag: string,
        value?: string,
    }>,
}
export function BooqCard({
    card: { id, title, author, cover, tags },
}: {
    card: BooqCardData,
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
            <div className='mt-4'>
                <Actions booqId={id} />
            </div>
        </div>
    </div>
}

function Header({ title, author }: {
    title?: string,
    author?: string,
}) {
    return <div className='flex flex-col items-baseline'>
        <span className="text-xl font-bold">{title}</span>
        {
            author &&
            <span className="text-lg">by <Link href={authorHref(author)}
                className='hover:underline'
            >
                {author}
            </Link></span>
        }
    </div>
}

function Actions({ booqId }: {
    booqId: string,
}) {
    return <div className='flex self-stretch justify-end'>
        <div className='ml-xl'>
            <ReadButton booqId={booqId} />
        </div>
    </div>
}

function ReadButton({ booqId }: {
    booqId: string,
}) {
    return <Link href={booqHref(booqId, [0])}>
        <span className='text-action underline text-lg cursor-pointer transition duration-300 hover:text-highlight'>
            Read
        </span>
    </Link>
}