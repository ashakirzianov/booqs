import Link from 'next/link'

import { parseId, type BooqId } from '@/core'
import { BooqCardData } from '@/data/booqs'
import { ReactNode } from 'react'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { CollectionButton } from './CollectionButton'
import { booqHref, authorHref } from '@/common/href'
export function BooqCollection({
    cards, title, collection, signed,
}: {
    title?: string,
    cards: BooqCardData[],
    collection?: string,
    signed: boolean,
}) {
    return (
        <section className='flex flex-row justify-center'>
            <div className='flex flex-col items-center max-w-[100rem]'>
                {title
                    ? <h1 className='font-bold p-4 text-2xl self-start'>{title}</h1>
                    : null
                }
                <ul className='flex flex-row flex-wrap lg:justify-between justify-center gap-4 p-4'>
                    {
                        cards.length === 0
                            ? <div className='text-xl text-gray-500 w-[30rem] max-w-[90vw]'>Nothing here yet</div>
                            : null
                    }
                    {cards.map(card => (
                        <li key={card.booqId} className='w-[30rem] max-w-[90vw] rounded-sm shadow py-2 px-4'>
                            <BooqCard
                                card={card}
                                actions={<>
                                    <ReadButton booqId={card.booqId} />
                                    {signed && collection ?
                                        <CollectionButton
                                            booqId={card.booqId}
                                            collection={collection}
                                            AddButtonContent={<span>Add</span>}
                                            RemoveButtonContent={<span>Remove</span>}
                                        />
                                        : null}
                                </>}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

function ReadButton({ booqId }: {
    booqId: BooqId,
}) {
    return <Link href={booqHref({ booqId, path: [0] })} className='text-action underline text-lg cursor-pointer transition duration-300 hover:text-highlight'>
        Read
    </Link>
}

function BooqCard({
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
                size={210}
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
