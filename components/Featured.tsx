import { BooqCard, BooqCardProps } from '@/components/BooqCard'
export function Featured({ cards }: {
    cards: BooqCardProps[],
}) {
    return <div className='flex flex-row justify-center'>
        <div className='flex flex-col items-center w-panel gap-1'>
            {
                cards.map(
                    (item, idx) => <BooqCard key={idx} {...item} />
                )
            }
        </div>
    </div>
}
