import { BooqCard, BooqCardData } from '@/components/BooqCard'
export function BooqCollection({
    cards, title,
}: {
    title?: string,
    cards: BooqCardData[],
}) {
    return (
        <div className='flex flex-row justify-center'>
            <div className='flex flex-col items-center w-panel gap-1'>
                {title
                    ? <h1 className='font-bold p-4 text-2xl'>{title}</h1>
                    : null
                }
                <ul>
                    {cards.map(card => (
                        <li key={card.id}>
                            <BooqCard card={card} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
