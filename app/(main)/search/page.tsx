import { booqHref } from '@/components/Links'
import { fetchSearchQuery, LibrarySearchResult, LibraryBooqSearchResult, LibraryAuthorSearchResult } from '@/data/search'
import Link from 'next/link'

export async function generateMetadata({
    searchParams,
}: {
    searchParams: { query: string }
}) {
    const { query } = searchParams
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
                        <SearchResult result={result} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

function SearchResult({ result }: {
    result: LibrarySearchResult,
}) {
    if (result.kind === 'book') {
        return <BooqSearchResult result={result} />
    } else if (result.kind === 'author') {
        return <AuthorSearchResult result={result} />
    } else {
        return null
    }
}

function BooqSearchResult({
    result,
}: {
    result: LibraryBooqSearchResult,
}) {
    return (
        <div>
            <h2>
                <Link href={booqHref(result.id)}>
                    {result.title}
                </Link>
            </h2>
            <p>by {result.authors[0]}</p>
        </div>
    )
}

function AuthorSearchResult({
    result,
}: {
    result: LibraryAuthorSearchResult,
}) {
    return (
        <div>
            <h2>{result.name}</h2>
        </div>
    )
}