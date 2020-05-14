import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { LinkButton } from '../controls/Buttons';
import { Panel } from '../controls/Panel';
import { BooqTags } from '../controls/BooqTags';
import { BooqCover } from '../controls/BooqCover';
import { boldWeight, meter } from '../controls/theme';

const FeaturedQuery = gql`query Featured {
    featured(limit: 10) {
        title
        author
        cover(size: 210)
        tags {
            tag
            value
        }
    }
}`;
type FeaturedData = {
    featured: {
        title?: string,
        author?: string,
        cover?: string,
        tags: {
            tag: string,
            value?: string,
        }[],
    }[],
};

function useFeatured() {
    const { loading, data } = useQuery<FeaturedData>(FeaturedQuery);
    return {
        loading,
        cards: (data?.featured ?? []),
    };
}

export function Featured() {
    const { cards } = useFeatured();
    return <div>
        {
            cards.map(
                (card, idx) => <FeaturedCard key={idx} {...card} />
            )
        }
        <style jsx>{`
            div {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            `}</style>
    </div>;
}

type FeaturedItem = FeaturedData['featured'][number];
function FeaturedCard({
    title, author, cover, tags,
}: FeaturedItem) {
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
