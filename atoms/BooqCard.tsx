import React from 'react';
import { PropsType } from './utils';
import { BooqCover } from './BooqCover';
import { meter, radius } from './meter';
import { usePalette, panelShadow } from './theme';

export type BooqTag = {
    tag: string,
    value?: string,
};

const cardWidth = '40rem';

export type BooqCardProps = PropsType<typeof BooqCard>;
export function BooqCard({
    title, author, cover, tags,
}: {
    title?: string,
    author?: string,
    cover?: string,
    tags: BooqTag[],
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
                margin: ${meter.large};
                border-radius: ${radius};
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
                flex-flow: column wrap;
                align-items: baseline;
            }
            .title {
                font-size: x-large;
                font-weight: normal;
            }
            .author {
                font-size: large;
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
        case 'pages':
            return <Pill
                color="black"
                label={`${tag.value} pages`}
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
                border-radius: 100px;
                padding: 0 ${meter.large} 0 0;
                margin: ${meter.small} ${meter.small} 0 0;
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