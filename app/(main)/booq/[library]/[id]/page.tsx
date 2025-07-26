import { booqDetailedData } from '@/data/booqs'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import { CollectionButton } from '@/components/CollectionButton'
import Link from 'next/link'
import { booqHref, authorHref } from '@/common/href'
import { notFound } from 'next/navigation'
import { getUserIdInsideRequest } from '@/data/auth'
import { READING_LIST_COLLECTION } from '@/application/collections'
import { fetchBooqHistory } from '@/data/history'
import type { BooqId, TableOfContentsItem } from '@/core'

type Params = {
    library: string,
    id: string,
}

export default async function Page({ params }: {
    params: Promise<Params>,
}) {
    const { library, id } = await params
    const booqId: BooqId = `${library}/${id}`

    const detailed = await booqDetailedData(booqId)
    if (!detailed) {
        notFound()
    }

    const toc = detailed?.toc
    const userId = await getUserIdInsideRequest()
    const isSignedIn = Boolean(userId)
    const history = await fetchBooqHistory(booqId)

    return <main className="flex flex-row justify-center min-h-screen bg-background">
        <div className="flex flex-col max-w-4xl w-full p-6">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                <div className="flex justify-center lg:justify-start">
                    <BooqCover
                        booqId={booqId}
                        coverSrc={detailed.coverSrc}
                        title={detailed.title}
                        author={detailed.authors.join(', ')}
                        size={120}
                    />
                </div>

                <div className="flex flex-col flex-1 justify-between">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-primary mb-4 leading-tight">
                            {detailed.title}
                        </h1>

                        {detailed.authors.length > 0 && (
                            <div className="text-xl text-dimmed mb-4">
                                by {detailed.authors.map((author, index) => (
                                    <span key={author}>
                                        <Link
                                            href={authorHref({ name: author, libraryId: library })}
                                            className="hover:underline  hover:text-highlight"
                                        >
                                            {author}
                                        </Link>
                                        {index < detailed.authors.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        )}

                        {(detailed.subjects.length > 0 || detailed.languages.length > 0) && (
                            <div className="mb-6">
                                <BooqTags
                                    subjects={detailed.subjects}
                                    languages={detailed.languages}
                                    booqId={booqId}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        <Link
                            href={history ? booqHref({ booqId, path: history.path }) : booqHref({ booqId, path: [0] })}
                            className="bg-action hover:bg-highlight text-light px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            {history ? 'Continue Reading' : 'Start Reading'}
                        </Link>

                        {isSignedIn && (
                            <CollectionButton
                                booqId={booqId}
                                collection={READING_LIST_COLLECTION}
                                AddButtonContent={<span>Add to Reading List</span>}
                                RemoveButtonContent={<span>Remove</span>}
                            />
                        )}
                    </div>
                </div>
            </div>

            {toc && toc.items.length > 0 && (
                <div className="pt-8">
                    <div className="flex justify-center mb-6">
                        <h2 className="tracking-widest font-bold text-dimmed">CONTENTS</h2>
                    </div>
                    <div className="space-y-2">
                        {toc.items.map((item, index) => (
                            <TableOfContentsItem
                                key={index}
                                item={item}
                                booqId={booqId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    </main>
}

function TableOfContentsItem({ item, booqId }: {
    item: TableOfContentsItem,
    booqId: BooqId,
}) {
    const paddingLeft = `${item.level * 1.5}rem`

    return (
        <Link
            href={booqHref({ booqId, path: item.path })}
            className="block py-2 px-3 rounded hover:bg-gray-50 transition-colors duration-150"
            style={{ paddingLeft }}
        >
            <span className="text-dimmed hover:text-action">
                {item.title || 'Untitled Chapter'}
            </span>
        </Link>
    )
}