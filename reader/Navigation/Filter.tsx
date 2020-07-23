import { ReactNode } from 'react';
import { UserData, useNavigationState } from "app";
import { ProfileBadge } from 'controls/ProfilePicture';
import { meter, boldWeight, vars, radius } from 'controls/theme';

export function NavigationFilter({ authors }: {
    self: UserData | undefined,
    authors: UserData[],
}) {
    const {
        showAuthors, showChapters, showHighlights,
        toggleAuthor, toggleChapters, toggleHighlights,
    } = useNavigationState();
    return <div className='container'>
        <div className='item'>
            <FilterButton
                text='Chapters'
                selected={showChapters}
                toggle={toggleChapters}
            />
        </div>
        <div className='item'>
            <FilterButton
                text='Highlights'
                selected={showHighlights}
                toggle={toggleHighlights}
            />
        </div>
        {
            authors.map(author => {
                const [first] = author.name?.split(' ') ?? ['Incognito'];
                return <div className='item' key={author.id}>
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
                </div>;
            })
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row wrap;
                margin: ${meter.large} 0;
            }
            .item {
                margin: ${meter.regular} ${meter.regular} 0 0;
            }
            `}</style>
    </div>
}

function FilterButton({ text, selected, toggle, Badge }: {
    text: string,
    selected: boolean,
    toggle: () => void,
    Badge?: ReactNode,
}) {
    return <div className='container' onClick={toggle}>
        {
            Badge
                ? <div className='badge'>{Badge}</div>
                : null
        }
        <span className='text'>{text}</span>
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: row;
                padding: ${meter.small} ${meter.regular};
                border-radius: 20px;
                border: 2px dotted;
                border-color: ${selected ? `var(${vars.dimmed})` : 'rgba(0,0,0,0)'};
                cursor: pointer;
                transition: 250ms color, 250ms border;
            }
            .container:hover {
                color: var(${vars.highlight});
                border-color: var(${vars.highlight});
            }
            .badge {
                margin-right: ${meter.regular};
            }
            .text {
                font-weight: ${boldWeight};
            }
            `}</style>
    </div>;
}