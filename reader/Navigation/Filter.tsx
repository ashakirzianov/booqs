import { ReactNode } from 'react'
import { UserInfo, useNavigationState } from '@/application'
import { ProfileBadge } from '@/controls/ProfilePicture'

export function NavigationFilter({ authors }: {
    self: UserInfo | undefined,
    authors: UserInfo[],
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
    return <div className='container py-sm px-base' onClick={toggle}>
        {
            Badge
                ? <div className='mr-base'>{Badge}</div>
                : null
        }
        <span className='font-bold'>{text}</span>
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row;
                border-radius: 20px;
                border: 2px dotted;
                border-color: ${selected ? `var(--theme-dimmed)` : 'rgba(0,0,0,0)'};
                cursor: pointer;
                transition: 250ms color, 250ms border;
            }
            .container:hover {
                color: var(--theme-highlight);
                border-color: var(--theme-highlight);
            }
            `}</style>
    </div>
}