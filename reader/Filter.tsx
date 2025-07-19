import { ReactNode } from 'react'
import { NavigationSelection } from './nodes'
import { AuthorData } from '@/core'

export function NavigationFilter({
    selection, toggle,
}: {
    authors: AuthorData[],
    selection: NavigationSelection,
    toggle: (id: string) => void,
}) {
    const itemClass = 'mt-base mr-base'
    return <div className='flex flex-row flex-wrap my-lg'>
        <div className={itemClass}>
            <FilterButton
                text='Chapters'
                selected={selection.chapters}
                toggle={() => toggle('chapters')}
            />
        </div>
        <div className={itemClass}>
            <FilterButton
                text='Notes'
                selected={selection.notes}
                toggle={() => toggle('notes')}
            />
        </div>
    </div>
}

function FilterButton({ text, selected, toggle, Badge }: {
    text: string,
    selected: boolean,
    toggle: () => void,
    Badge?: ReactNode,
}) {
    const borderClass = selected ? 'border-dimmed' : 'border-transparent'
    return <div className={`flex rounded-2xl border-2 border-dotted ${borderClass} cursor-pointer transition-all py-sm px-base hover:text-highlight hover:border-highlight`} onClick={toggle}>
        {
            Badge
                ? <div className='mr-base'>{Badge}</div>
                : null
        }
        <span className='font-bold'>{text}</span>
    </div>
}