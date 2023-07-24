import React from 'react'

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
    return <div title={title} className='pr-lg mt-sm mr-sm' style={{
        fontSize: 'small',
        color,
        borderRadius: '100px',
    }}>
        {label}
    </div>
}
