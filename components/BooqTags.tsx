import React from 'react'
import Link from 'next/link'
import { parseId, BooqId } from '@/core'
import { subjectHref, languageHref } from '@/common/href'
import { LanguageInfo } from '@/data/booqs'

export function BooqTags({ subjects, languages, booqId }: {
    subjects: string[],
    languages: LanguageInfo[],
    booqId?: BooqId,
}) {
    const libraryId = booqId ? parseId(booqId)[0] || 'pg' : 'pg'
    return <div style={{
        display: 'flex',
        flexFlow: 'row wrap',
    }}>
        {
            subjects.map(
                (subject, idx) => <SubjectPill
                    key={`subject-${idx}`}
                    color="#673AB7"
                    label={subject}
                    subject={subject}
                    libraryId={libraryId}
                />
            )
        }
        {
            languages.map(
                (language, idx) => <LanguagePill
                    key={`language-${idx}`}
                    color="#4CAF50"
                    language={language}
                    libraryId={libraryId}
                />
            )
        }
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

function LanguagePill({ color, language, libraryId }: {
    color: string,
    language: LanguageInfo,
    libraryId: string
}) {
    return <Link href={languageHref({ language: language.code, libraryId })}>
        <div className='pr-lg mt-sm mr-sm text-sm cursor-pointer hover:underline' style={{
            color,
        }}>
            {language.name}
        </div>
    </Link>
}
