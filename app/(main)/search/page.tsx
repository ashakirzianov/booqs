import { authorHref, booqHref } from '@/application/href'
import { AuthorSearchResultClient, BooqSearchResultClient, fetchSearchQuery, SearchResultClient } from '@/data/search'
import Link from 'next/link'

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ query: string }>
}) {
    const { query } = await searchParams
    return {
        title: `Search results for "${query}"`,
        description: `Search results for "${query}"`,
    }
}
export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ query: string }>
}) {
    const { query } = await searchParams
    const results = await fetchSearchQuery(query)
    return (
        <div>
            <h1>Search results for &quot;{query}&quot;</h1>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>
                        <SearchResultItem result={result} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

function SearchResultItem({ result }: {
    result: SearchResultClient,
}) {
    if (result.kind === 'booq') {
        return <BooqSearchResultItem result={result} />
    } else if (result.kind === 'author') {
        return <AuthorSearchResultItem result={result} />
    } else {
        return null
    }
}

function BooqSearchResultItem({
    result,
}: {
    result: BooqSearchResultClient,
}) {
    return (
        <div>
            <h2>
                <Link href={booqHref({ booqId: result.booqId })}>
                    {result.title}
                </Link>
            </h2>
            <p>by {result.authors?.join(', ')}</p>
        </div>
    )
}

function AuthorSearchResultItem({
    result,
}: {
    result: AuthorSearchResultClient,
}) {
    return (
        <div>
            <h2><Link href={authorHref({ name: result.name })}>
                {result.name}
            </Link></h2>
        </div>
    )
}