import { authorHref, booqDetailsHref, booqContentHref } from '@/common/href'
import { AuthorSearchResultData, BooqSearchResultData, booqSearch } from '@/data/booqs'
import Link from 'next/link'
import styles from '@/app/(main)/MainLayout.module.css'
import { BooqCover } from '@/components/BooqCover'
import { CollectionButton } from '@/app/(main)/CollectionButton'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { getUserIdInsideRequest } from '@/data/request'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ query: string }>
}) {
    const { query } = await params
    const decoded = decodeURIComponent(query)
    return {
        title: `Search results for "${decoded}" - Booqs`,
        description: `Find books, authors, and topics related to "${decoded}". Browse our collection of classic literature and contemporary works.`,
    }
}

export default async function SearchPage({
    params,
}: {
    params: Promise<{ query: string }>
}) {
    const { query } = await params
    const decoded = decodeURIComponent(query)
    const [results, userId] = await Promise.all([
        booqSearch({ query: decoded, libraryId: 'pg' }),
        getUserIdInsideRequest(),
    ])
    const signed = Boolean(userId)
    const authors = results.filter(r => r.kind === 'author') as AuthorSearchResultData[]
    const booqs = results.filter(r => r.kind === 'booq') as BooqSearchResultData[]

    return (
        <main className={styles.mainContent}>
            <h1 className='text-2xl font-bold px-4 pt-6 pb-2 text-primary'>
                Search results for &ldquo;{decoded}&rdquo;
            </h1>
            {results.length === 0
                ? <p className='text-dimmed px-4 py-8 text-center'>No results found for &ldquo;{decoded}&rdquo;.</p>
                : <>
                    {authors.length > 0 && (
                        <section className='mb-6'>
                            <h2 className='text-lg font-bold px-4 py-2 text-dimmed uppercase tracking-wide'>Authors</h2>
                            <ul className='flex flex-col'>
                                {authors.map((result, idx) => (
                                    <li key={idx}>
                                        <AuthorResultRow result={result} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {booqs.length > 0 && (
                        <section>
                            {authors.length > 0 && (
                                <h2 className='text-lg font-bold px-4 py-2 text-dimmed uppercase tracking-wide'>Books</h2>
                            )}
                            <ul className='flex flex-col'>
                                {booqs.map((result, idx) => (
                                    <li key={idx} className='border-b border-border last:border-b-0'>
                                        <BooqResultRow result={result} signed={signed} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </>
            }
        </main>
    )
}

function BooqResultRow({ result, signed }: { result: BooqSearchResultData, signed: boolean }) {
    const author = result.authors?.join(', ')
    return (
        <div className='flex flex-row gap-4 items-center px-4 py-3 hover:bg-border transition-colors'>
            <Link href={booqDetailsHref({ booqId: result.booqId })} className='shrink-0'>
                <BooqCover
                    booqId={result.booqId}
                    coverSrc={result.coverSrc}
                    title={result.title}
                    author={author}
                    size={60}
                />
            </Link>
            <div className='flex flex-col flex-1 min-w-0'>
                <Link href={booqDetailsHref({ booqId: result.booqId })} className='text-lg font-bold text-primary hover:underline truncate'>
                    {result.title}
                </Link>
                {author && (
                    <span className='text-dimmed text-sm'>
                        by <Link href={authorHref({ name: author, libraryId: 'pg' })} className='hover:underline'>
                            {author}
                        </Link>
                    </span>
                )}
            </div>
            <div className='shrink-0 flex gap-3 items-center'>
                {signed && (
                    <CollectionButton
                        booqId={result.booqId}
                        collection={READING_LIST_COLLECTION}
                        AddButtonContent={<span>Add</span>}
                        RemoveButtonContent={<span>Remove</span>}
                    />
                )}
                <Link href={booqContentHref({ booqId: result.booqId, path: [0] })} className='text-action hover:text-highlight transition-colors font-bold'>
                    Read
                </Link>
            </div>
        </div>
    )
}

function AuthorResultRow({ result }: { result: AuthorSearchResultData }) {
    return (
        <Link
            href={authorHref({ name: result.name, libraryId: 'pg' })}
            className='flex items-center px-4 py-3 text-primary hover:bg-border transition-colors border-b border-border last:border-b-0'
        >
            <span className='text-lg'>{result.name}</span>
        </Link>
    )
}
