import React from 'react';
import { PropsType } from './utils';

export type BooqTag = {
    tag: string,
    value?: string,
};

export type BooqCardProps = PropsType<typeof BooqCard>;
export function BooqCard({
    title, author, cover, tags, length,
}: {
    title?: string,
    author?: string,
    cover?: string,
    tags: BooqTag[],
    length: number,
}) {
    return <div>
        <div>
            <img src={cover} />
        </div>
        <div>
            <span>{title}</span>
            <span>{author}</span>
        </div>
    </div>;
}

function BooqTags({ tags }: {
    tags: BooqTag[],
}) {
    return <div>
        {
            tags.map(
                tag => <BooqTagPill tag={tag} />
            )
        }
    </div>;
}

function BooqTagPill({ tag }: {
    tag: BooqTag,
}) {
    return <span>{tag.tag}</span>;
}