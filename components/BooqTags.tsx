import { BooqMetaTag } from '@/core'
import React from 'react'

export function BooqTags({ tags }: {
    tags: BooqMetaTag[],
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

function BooqTagPill({ tag: [name, value] }: {
    tag: BooqMetaTag,
}) {
    switch (name.toLowerCase()) {
        case 'language':
            return value
                ? <Pill
                    color="#4CAF50"
                    label={value.toUpperCase()}
                />
                : null
        case 'subject':
            return <Pill
                color="#673AB7"
                label={value ?? 'subject'}
            />
        case 'pg-index':
            return <Pill
                color="pink"
                label="Project Gutenberg"
                title={value ?? undefined}
            />
        case 'pages':
            return <Pill
                color='var(--theme-primary)'
                label={`${value} pages`}
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
    return <div title={title} className='pr-lg mt-sm mr-sm text-sm' style={{
        color,
    }}>
        {label}
    </div>
}
