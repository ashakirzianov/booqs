import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/components/BooqCollection'
import { Pagination } from '@/components/Pagination'
import { getUserIdInsideRequest } from '@/data/auth'
import { booqCardsForAuthor, booqCardsForSubject, booqCardsForLanguage } from '@/data/booqs'
import { notFound } from 'next/navigation'

type ValidKind = 'author' | 'subject' | 'language'

const validKinds: ValidKind[] = ['author', 'subject', 'language']
const PAGE_SIZE = 24

function isValidKind(kind: string): kind is ValidKind {
    return validKinds.includes(kind as ValidKind)
}

function getLanguageDisplayName(languageCode: string): string {
    const languageNames: Record<string, string> = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ko': 'Korean',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'pl': 'Polish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'tr': 'Turkish',
        'he': 'Hebrew',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'ms': 'Malay',
        'tl': 'Filipino',
        'uk': 'Ukrainian',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'ro': 'Romanian',
        'et': 'Estonian',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'mt': 'Maltese',
        'ga': 'Irish',
        'cy': 'Welsh',
        'is': 'Icelandic',
        'mk': 'Macedonian',
        'sq': 'Albanian',
        'sr': 'Serbian',
        'bs': 'Bosnian',
        'me': 'Montenegrin',
        'la': 'Latin',
        'eo': 'Esperanto',
    }
    
    return languageNames[languageCode.toLowerCase()] || languageCode
}

export default async function LibraryQuery({
    params,
    searchParams,
}: {
    params: Promise<{ library: string, kind: string, query: string }>,
    searchParams: Promise<{ page?: string }>,
}) {
    const { library, kind, query } = await params
    const { page: pageParam } = await searchParams
    
    if (!isValidKind(kind)) {
        notFound()
    }
    
    const decoded = decodeURIComponent(query)
    const currentPage = Math.max(1, parseInt(pageParam || '1', 10))
    const offset = (currentPage - 1) * PAGE_SIZE
    
    let result
    let title
    
    switch (kind) {
        case 'author':
            result = await booqCardsForAuthor({ 
                author: decoded, 
                libraryId: library, 
                limit: PAGE_SIZE, 
                offset 
            })
            title = `Books by ${decoded}`
            break
        case 'subject':
            result = await booqCardsForSubject({ 
                subject: decoded, 
                libraryId: library, 
                limit: PAGE_SIZE, 
                offset 
            })
            title = `Books on ${decoded}`
            break
        case 'language':
            result = await booqCardsForLanguage({ 
                language: decoded, 
                libraryId: library, 
                limit: PAGE_SIZE, 
                offset 
            })
            title = `Books in ${getLanguageDisplayName(decoded)}`
            break
        default:
            notFound()
    }
    
    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false
    
    const baseUrl = `/library/${library}/${kind}/${query}`
    
    return (
        <div>
            <BooqCollection
                title={title}
                cards={result.cards}
                collection={READING_LIST_COLLECTION}
                signed={signed}
            />
            <Pagination
                currentPage={currentPage}
                hasMore={result.hasMore}
                total={result.total}
                baseUrl={baseUrl}
                pageSize={PAGE_SIZE}
            />
        </div>
    )
}