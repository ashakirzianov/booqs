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
    return <div className='container my-base'>
        {
            items.map(
                (item, idx) => <div
                    key={idx}
                    className={`item cursor-pointer my-sm mx-base ${item.value === selected ? 'selected' : ''}`}
                    onClick={() => select(item.value)}
                >
                    {item.text}
                </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
            }
            .item:hover {
                border-bottom: 2px solid var(--theme-highlight);
            }
            .item.selected {
                border-bottom: 2px solid var(--theme-highlight);
            }
            `}</style>
    </div>
}