import React from 'react';
import { meter, vars } from './theme';

export type BooqTag = {
    tag: string,
    value?: string,
};
export function BooqTags({ tags }: {
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
                color={`var(${vars.primary})`}
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
