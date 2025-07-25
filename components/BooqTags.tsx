import React from 'react'
import Link from 'next/link'

type BooqMetaTag = readonly [tag: string, value?: string]
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
                ? <LanguagePill
                    color="#4CAF50"
                    label={value.toUpperCase()}
                    language={value}
                />
                : null
        case 'subject':
            return value 
                ? <SubjectPill
                    color="#673AB7"
                    label={value}
                    subject={value}
                />
                : null
        case 'pg-index':
            return <Pill
                color="pink"
                label="Project Gutenberg"
                title={value ?? undefined}
            />
        case 'pages':
            return <Pill
                color='var(--color-primary)'
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

function SubjectPill({ color, label, subject }: {
    color: string,
    label: string,
    subject: string
}) {
    return <Link href={`/subject/${encodeURIComponent(subject)}`}>
        <div className='pr-lg mt-sm mr-sm text-sm cursor-pointer hover:underline' style={{
            color,
        }}>
            {label}
        </div>
    </Link>
}

function LanguagePill({ color, label, language }: {
    color: string,
    label: string,
    language: string
}) {
    return <Link href={`/language/${encodeURIComponent(language)}`}>
        <div className='pr-lg mt-sm mr-sm text-sm cursor-pointer hover:underline' style={{
            color,
        }}>
            {label}
        </div>
    </Link>
}
