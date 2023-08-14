import { BooqCard, BooqCardData } from '@/components/BooqCard'
export function BooqCollection({
    cards, title,
}: {
    title?: string,
    cards: BooqCardData[],
}) {
    return (
        <div className='flex flex-row justify-center'>
            <div className='flex flex-col items-center max-w-[100rem]'>
                {title
                    ? <h1 className='font-bold p-4 text-2xl self-start'>{title}</h1>
                    : null
                }
                <ul className='flex flex-row flex-wrap lg:justify-between justify-center gap-4 p-4'>
                    {cards.map(card => (
                        <li key={card.id} className='w-[30rem] max-w-[90vw] rounded shadow py-2 px-4'>
                            <BooqCard card={card} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
