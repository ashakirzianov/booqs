import React from 'react'
import { meter } from './theme'

export type BooqTag = {
    tag: string,
    value?: string,
};
export function BooqTags({ tags }: {
    tags: BooqTag[],
}) {
    return <div style={{
        display: 'flex',
        flexFlow: 'row wrap',
    }}>
        {
            tags.map(
                (tag, idx) => <BooqTagPill key={idx} tag={tag} />
            )
        }
    </div>
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
                : null
        case 'subject':
            return <Pill
                color="#673AB7"
                label={tag.value ?? 'subject'}
            />
        case 'pg-index':
            return <Pill
                color="pink"
                label="Project Gutenberg"
                title={tag.value}
            />
        case 'pages':
            return <Pill
                color='var(--theme-primary)'
                label={`${tag.value} pages`}
            />
        default:
            return null
    }
}

function Pill({ color, label, title }: {
    color: string,
    label: string,
    title?: string
}) {
    return <div title={title} style={{
        fontSize: 'small',
        color,
        borderRadius: '100px',
        padding: `0 ${meter.large} 0 0`,
        margin: `${meter.small} ${meter.small} 0 0`,
    }}>
        {label}
    </div>
}
