import { READING_LIST_COLLECTION } from '@/application/collections'
import { BooqCollection } from '@/app/(main)/BooqCollection'
import { Pagination } from '@/app/(main)/Pagination'
import { booqCardsForQuery, fetchLanguageDisplayName } from '@/data/booqs'
import { getUserIdInsideRequest } from '@/data/request'
import { notFound } from 'next/navigation'
import styles from '@/app/(main)/MainLayout.module.css'
import { Metadata } from 'next'

type ValidKind = 'author' | 'subject' | 'language'

const validKinds: ValidKind[] = ['author', 'subject', 'language']
const PAGE_SIZE = 24

function isValidKind(kind: string): kind is ValidKind {
    return validKinds.includes(kind as ValidKind)
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ library: string, kind: string, query: string }>,
}): Promise<Metadata> {
    const { kind, query } = await params

    if (!isValidKind(kind)) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.',
        }
    }

    const decoded = decodeURIComponent(query)
    
    let title: string
    let description: string

    switch (kind) {
        case 'author':
            title = `Books by ${decoded} - Booqs`
            description = `Discover books by ${decoded}. Browse and read classic literature and contemporary works.`
            break
        case 'subject':
            title = `Books on ${decoded} - Booqs`
            description = `Explore books about ${decoded}. Find literature, non-fiction, and educational content.`
            break
        case 'language':
            const displayName = await fetchLanguageDisplayName(decoded)
            title = `Books in ${displayName} - Booqs`
            description = `Browse books written in ${displayName}. Discover literature from around the world.`
            break
        default:
            title = 'Books - Booqs'
            description = 'Browse our collection of books.'
    }

    return {
        title,
        description,
    }
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
            result = await booqCardsForQuery({
                kind: 'author',
                query: decoded,
                libraryId: library,
                limit: PAGE_SIZE,
                offset,
                coverSize: 210
            })
            title = `Booqs by ${decoded}`
            break
        case 'subject':
            result = await booqCardsForQuery({
                kind: 'subject',
                query: decoded,
                libraryId: library,
                limit: PAGE_SIZE,
                offset,
                coverSize: 210
            })
            title = `Booqs on ${decoded}`
            break
        case 'language':
            result = await booqCardsForQuery({
                kind: 'language',
                query: decoded,
                libraryId: library,
                limit: PAGE_SIZE,
                offset,
                coverSize: 210
            })
            const displayName = await fetchLanguageDisplayName(decoded)
            title = `Booqs in ${displayName}`
            break
        default:
            notFound()
    }

    const userId = await getUserIdInsideRequest()
    const signed = userId ? true : false

    const baseUrl = `/library/${library}/${kind}/${query}`

    return (
        <main className={styles.mainContent}>
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
        </main>
    )
}