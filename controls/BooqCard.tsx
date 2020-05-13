import React from 'react';
import { BooqCover } from './BooqCover';
import { meter } from './meter';
import { Panel } from './Panel';
import { LinkButton } from './Buttons';
import { BooqTag, BooqTags } from './BooqTags';
import { boldWeight } from './theme';
import { PropsType } from './utils';


export type BooqCardProps = PropsType<typeof BooqCard>;
export function BooqCard({
    title, author, cover, tags,
}: {
    title?: string,
    author?: string,
    cover?: string,
    tags: BooqTag[],
}) {
    return <Panel>
        <div className="container">
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
            .container {
                display: flex;
                flex-direction: row;
                flex: 1;
                padding: ${meter.large};
            }
            .details {
                display: flex;
                flex-direction: column;
                flex: 1;
                justify-content: space-between;
                margin-left: ${meter.xxLarge};
            }
            `}</style>
        </div>
    </Panel>;
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
                font-weight: ${boldWeight};
            }
            .author {
                font-size: large;
            }
            `}</style>
    </div>;
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