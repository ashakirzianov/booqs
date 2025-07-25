import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForAuthor, booqCardsForSubject, booqCardsForLanguage } from '@/data/booqs'
import { notFound } from 'next/navigation'

type ValidKind = 'author' | 'subject' | 'language'

const validKinds: ValidKind[] = ['author', 'subject', 'language']

function isValidKind(kind: string): kind is ValidKind {
    return validKinds.includes(kind as ValidKind)
}

export default async function LibraryQuery({
    params,
}: {
    params: Promise<{ library: string, kind: string, query: string }>,
}) {
    const { library, kind, query } = await params
    
    if (!isValidKind(kind)) {
        notFound()
    }
    
    const decoded = decodeURIComponent(query)
    
    let booqs
    let title
    
    switch (kind) {
        case 'author':
            booqs = await booqCardsForAuthor({ author: decoded, libraryId: library })
            title = `Books by ${decoded}`
            break
        case 'subject':
            booqs = await booqCardsForSubject({ subject: decoded, libraryId: library })
            title = `Books on ${decoded}`
            break
        case 'language':
            booqs = await booqCardsForLanguage({ language: decoded, libraryId: library })
            title = `Books in ${decoded}`
            break
        default:
            notFound()
    }
    
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    
    return <BooqCollection
        title={title}
        cards={booqs}
        collection={READING_LIST_COLLECTION}
        signed={signed}
    />
}