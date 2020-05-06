import React from 'react';
import { PropsType } from './utils';
import { BooqCover } from './BooqCover';
import { meter } from './meter';
import { Icon } from './Icon';
import { usePalette } from './theme';

export type BooqTag = {
    tag: string,
    value?: string,
};

const cardWidth = '40rem';
const panelShadow = '0px 3px 10px rgba(0, 0, 0, 0.1)';

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
    return <div className="panel">
        <BooqCover
            title={title}
            author={author}
            cover={cover}
        />
        <div className="details">
            <div>
                <Header title={title} author={author} />
                <BooqTags tags={tags} />
                <LengthInfo pages={length} />
            </div>
            <Actions />
        </div>
        <style jsx>{`
            .panel {
                display: flex;
                flex-direction: row;
                flex: 0 1;
                width: 100%;
                max-width: ${cardWidth};
                margin: ${meter.xLarge};
                border-radius: 5px;
                box-shadow: ${panelShadow};
                overflow: hidden;
            }
            .details {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                margin-left: ${meter.large};
                padding: ${meter.large};
                width: 100%;
            }
            .title {
                font-size: x-large;
            }
            .author {
                font-size: large;
                font-style: italic;
            }
            `}</style>
    </div>;
}

function Header({ title, author }: {
    title?: string,
    author?: string,
}) {
    return <div>
        <span className="title">{title}</span>
        <span className="author">by {author}</span>
        <style jsx>{`
            div {
                display: flex;
                flex-flow: row wrap;
                align-items: baseline;
            }
            .title {
                font-size: x-large;
            }
            .author {
                margin-left: ${meter.regular};
                font-size: x-large;
                font-style: italic;
            }
            `}</style>
    </div>;
}

function BooqTags({ tags }: {
    tags: BooqTag[],
}) {
    return <div>
        {
            tags.map(
                (tag, idx) => <BooqTagPill key={idx} tag={tag} />
            )
        }
        <style jsx>{`
            div {
                display: flex;
                flex-flow: row wrap;
                margin: ${meter.large} 0 0 0;
            }
            `}</style>
    </div>;
}

function BooqTagPill({ tag }: {
    tag: BooqTag,
}) {
    switch (tag.tag.toLowerCase()) {
        case 'language':
            return tag.value
                ? <Pill
                    color="#4CAF50"
                    label={tag.value.toUpperCase()}
                />
                : null;
        case 'subject':
            return <Pill
                color="#673AB7"
                label={tag.value ?? 'subject'}
            />;
        case 'pg-index':
            return <Pill
                color="pink"
                label="Project Gutenberg"
                title={tag.value}
            />;
        default:
            return null;
    }
}

function Pill({ color, label, title }: {
    color: string,
    label: string,
    title?: string
}) {
    return <div title={title}>
        {label}
        <style jsx>{`
            div {
                font-size: small;
                color: ${color};
                border: 1px solid ${color};
                border-radius: 100px;
                padding: 0 ${meter.large};
                margin: 0 ${meter.small} 0 0;
            }
            `}</style>
    </div>
}

function LengthInfo({ pages }: {
    pages: number,
}) {
    return <div>
        <Icon name='pages' size={14} />
        <span>{`${pages} pages`}</span>
        <style jsx>{`
            div {
                margin: ${meter.large} 0 0 0;
            }
            span {
                margin-left: ${meter.regular};
            }
            `}</style>
    </div>
}

function Actions() {
    return <div>
        <div>
            <LinkButton text="Add +" />
        </div>
        <div>
            <LinkButton text="Read &rarr;" />
        </div>
        <style jsx>{`
        div {
            display: flex;
            align-self: stretch;
            justify-content: flex-end;
        }
        div > * {
            margin: 0 0 0 ${meter.xLarge};
        }
        `}</style>
    </div>;
}

function LinkButton({ text }: {
    text: string,
}) {
    const { highlight } = usePalette();
    return <>
        <a>{text}</a>
        <style jsx>{`
        a {
            color: ${highlight};
            text-decoration: none;
            font-size: large;
            cursor: pointer;
        }
        a:hover {
            text-decoration: underline;
        }
        `}</style>
    </>;
}