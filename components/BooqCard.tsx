import Link from 'next/link'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { authorHref, booqHref } from '@/common/href'
import { parseId } from '@/core'
import { ReactNode } from 'react'
import { BooqCardData } from '@/data/booqs'

export function BooqCard({
    card: { booqId, title, authors, cover, subjects, languages },
    actions,
}: {
    card: BooqCardData,
    actions?: ReactNode,
}) {
    const author = authors?.join(', ')
    const booqUrl = booqHref({ booqId })
    const [libraryId] = parseId(booqId)
    return <div className="flex flex-col grow gap-4 items-center sm:flex-row sm:flex-wrap sm:items-stretch h-full">
        <Link href={booqUrl}>
            <BooqCover
                title={title ?? undefined}
                author={author}
                cover={cover}
            />
        </Link>
        <div className="flex flex-col flex-1 justify-between">
            <div className='header'>
                <Header title={title} author={author} booqUrl={booqUrl} libraryId={libraryId} />
            </div>
            <div className='mt-4'>
                <BooqTags
                    subjects={subjects ?? []}
                    languages={languages ?? []}
                    booqId={booqId}
                />
            </div>
            <div className='mt-4 flex gap-2 self-stretch justify-end ml-xl'>
                {actions}
            </div>
        </div>
    </div>
}

function Header({ title, author, booqUrl, libraryId }: {
    title: string | undefined,
    author: string | undefined,
    booqUrl: string,
    libraryId: string,
}) {
    return <div className='flex flex-col items-baseline'>
        <Link href={booqUrl} className="text-xl font-bold hover:underline">
            {title}
        </Link>
        {
            author &&
            <span className="text-lg">by <Link href={authorHref({ name: author, libraryId })}
                className='hover:underline'
            >
                {author}
            </Link></span>
        }
    </div>
}