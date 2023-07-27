import React, { useState } from 'react'

type FilterItem = {
    text: string,
    value: string,
}

export function useFilterPanel({ items, initial }: {
    items: FilterItem[],
    initial?: string,
}) {
    const [filter, setFilter] = useState(initial ?? items[0].value)
    const FilterNode = <FilterPanel
        items={items}
        selected={filter}
        select={setFilter}
    />
    return {
        filter, FilterNode,
    }
}
export function FilterPanel({
    items, selected, select,
}: {
    items: FilterItem[],
    selected: string,
    select: (value: string) => void,
}) {
    return <div className='flex flex-row flex-wrap my-base'>
        {
            items.map(
                (item, idx) => <div
                    key={idx}
                    className={`item cursor-pointer my-sm mx-base border-2 border-transparent ${item.value === selected ? 'border-highlight' : ''} hover:border-highlight`}
                    onClick={() => select(item.value)}
                >
                    {item.text}
                </div>
            )
        }
    </div>
}