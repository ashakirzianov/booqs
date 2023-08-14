import { BooqCard, BooqCardData } from '@/components/BooqCard'
export function Featured({ cards }: {
    cards: BooqCardData[],
}) {
    return <div className='flex flex-row justify-center'>
        <div className='flex flex-col items-center w-panel gap-1'>
            {
                cards.map(
                    (item, idx) => <BooqCard key={idx} card={item} />
                )
            }
        </div>
    </div>
}
