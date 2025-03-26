import { BooqCard, BooqCardData } from '@/components/BooqCard'
import Link from 'next/link'
import { booqHref } from './Links'
import { CollectionButton } from './CollectionButton'
export function BooqCollection({
    cards, title, collection,
}: {
    title?: string,
    cards: BooqCardData[],
    collection?: string,
}) {
    return (
        <div className='flex flex-row justify-center'>
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
                        <li key={card.id} className='w-[30rem] max-w-[90vw] rounded-sm shadow py-2 px-4'>
                            <BooqCard
                                card={card}
                                actions={<>
                                    <CollectionButton booqId={card.id} collection={collection} />
                                    <ReadButton booqId={card.id} />
                                </>}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
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
