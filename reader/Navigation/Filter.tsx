import { ReactNode } from 'react'
import { ProfileBadge } from '@/components/ProfilePicture'
import { User } from '@/application/auth'
import { useNavigationState } from '@/application/navigation'

export function NavigationFilter({ authors }: {
    self: User | undefined,
    authors: User[],
}) {
    const {
        showAuthors, showChapters, showHighlights,
        toggleAuthor, toggleChapters, toggleHighlights,
    } = useNavigationState()
    const itemClass = 'mt-base mr-base'
    return <div className='flex flex-row flex-wrap my-lg'>
        <div className={itemClass}>
            <FilterButton
                text='Chapters'
                selected={showChapters}
                toggle={toggleChapters}
            />
        </div>
        <div className={itemClass}>
            <FilterButton
                text='Highlights'
                selected={showHighlights}
                toggle={toggleHighlights}
            />
        </div>
        {
            authors.map(author => {
                const [first] = author.name?.split(' ') ?? ['Incognito']
                return <div className={itemClass} key={author.id}>
                    <FilterButton
                        text={first ?? 'Incognito'}
                        selected={showAuthors.some(id => id === author.id)}
                        toggle={() => toggleAuthor(author.id)}
                        Badge={<ProfileBadge
                            size={1}
                            border={false}
                            name={author.name}
                            picture={author.pictureUrl ?? undefined}
                        />}
                    />
                </div>
            })
        }
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