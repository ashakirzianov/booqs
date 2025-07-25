import { BooqCard } from '@/components/BooqCard'
import Link from 'next/link'
import { booqHref } from '../common/href'
import { CollectionButton } from './CollectionButton'
import type { BooqId } from '@/core'
import { BooqCardData } from '@/data/booqs'
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
    return <Link href={booqHref({ booqId, path: [0] })}>
        <span className='text-action underline text-lg cursor-pointer transition duration-300 hover:text-highlight'>
            Read
        </span>
    </Link>
}
