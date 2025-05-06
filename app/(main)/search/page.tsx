import { authorHref, booqHref } from '@/application/href'
import { AuthorSearchResult, BooqSearchResult, SearchResult } from '@/core'
import { fetchSearchQuery } from '@/data/search'
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
    result: SearchResult,
}) {
    if (result.kind === 'book') {
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
    result: BooqSearchResult,
}) {
    return (
        <div>
            <h2>
                <Link href={booqHref({ id: result.card.id })}>
                    {result.card.title}
                </Link>
            </h2>
            <p>by {result.card.authors[0]}</p>
        </div>
    )
}

function AuthorSearchResultItem({
    result,
}: {
    result: AuthorSearchResult,
}) {
    return (
        <div>
            <h2><Link href={authorHref({ name: result.author.name })}>
                {result.author.name}
            </Link></h2>
        </div>
    )
}