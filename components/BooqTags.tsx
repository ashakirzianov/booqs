import React from 'react'
import Link from 'next/link'
import { parseId, BooqId } from '@/core'
import { subjectHref, languageHref } from '@/core/href'

type BooqMetaTag = readonly [tag: string, value?: string]
export function BooqTags({ tags, booqId }: {
    tags: BooqMetaTag[],
    booqId?: BooqId,
}) {
    const libraryId = booqId ? parseId(booqId)[0] || 'pg' : 'pg'
    return <div style={{
        display: 'flex',
        flexFlow: 'row wrap',
    }}>
        {
            tags.map(
                (tag, idx) => <BooqTagPill key={idx} tag={tag} libraryId={libraryId} />
            )
        }
    </div>
}

function BooqTagPill({ tag: [name, value], libraryId }: {
    tag: BooqMetaTag,
    libraryId: string,
}) {
    switch (name.toLowerCase()) {
        case 'language':
            return value
                ? <LanguagePill
                    color="#4CAF50"
                    label={value.toUpperCase()}
                    language={value}
                    libraryId={libraryId}
                />
                : null
        case 'subject':
            return value 
                ? <SubjectPill
                    color="#673AB7"
                    label={value}
                    subject={value}
                    libraryId={libraryId}
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

function SubjectPill({ color, label, subject, libraryId }: {
    color: string,
    label: string,
    subject: string,
    libraryId: string
}) {
    return <Link href={subjectHref({ subject, libraryId })}>
        <div className='pr-lg mt-sm mr-sm text-sm cursor-pointer hover:underline' style={{
            color,
        }}>
            {label}
        </div>
    </Link>
}

function LanguagePill({ color, label, language, libraryId }: {
    color: string,
    label: string,
    language: string,
    libraryId: string
}) {
    return <Link href={languageHref({ language, libraryId })}>
        <div className='pr-lg mt-sm mr-sm text-sm cursor-pointer hover:underline' style={{
            color,
        }}>
            {label}
        </div>
    </Link>
}
