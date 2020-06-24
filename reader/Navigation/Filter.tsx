import { ReactNode } from 'react';
import { UserData } from "app";
import { ProfileBadge } from 'controls/ProfilePicture';
import { meter } from 'controls/theme';

export function NavigationFilter({ authors }: {
    self: UserData | undefined,
    authors: UserData[],
}) {
    return <div className='container'>
        <div className='item'>
            <FilterButton text='Chapters' />
        </div>
        <div className='item'><FilterButton text='Highlights' /></div>
        {
            authors.map(author => {
                const [first] = author.name.split(' ');
                return <div className='item' key={author.id}>
                    <FilterButton
                        text={first}
                        Badge={<ProfileBadge
                            size={16}
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
            }
            .item {
                margin: ${meter.regular} ${meter.large} 0 0;
            }
            `}</style>
    </div>
}

function FilterButton({ text, Badge }: {
    Badge?: ReactNode,
    text: string,
}) {
    return <div className='container'>
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
            }
            .badge {
                margin-right: ${meter.regular};
            }
            `}</style>
    </div>;
}