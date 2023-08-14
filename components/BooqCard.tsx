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
    return <div className="flex flex-col grow items-center p-lg sm:flex-row sm:flex-wrap sm:items-stretch">
        <div className='flex m-base sm:my-base sm:mr-2xl sm:ml-0'>
            <BooqCover
                title={title}
                author={author}
                cover={cover}
            />
        </div>
        <div className="flex flex-col flex-1 justify-between py-base px-0">
            <div className='header'>
                <Header title={title} author={author} />
            </div>
            <div className='mt-lg'>
                <BooqTags tags={tags} />
            </div>
            <div className='mt-lg'>
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