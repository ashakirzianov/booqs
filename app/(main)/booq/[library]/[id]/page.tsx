import { booqCard, booqPart } from '@/data/booqs'
import { BooqCover } from '@/components/BooqCover'
import { BooqTags } from '@/components/BooqTags'
import Link from 'next/link'
import { booqHref, authorHref } from '@/core/href'
import { notFound } from 'next/navigation'
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
    const card = await booqCard(booqId)
    
    if (!card) {
        notFound()
    }
    
    const booqData = await booqPart({ booqId })
    const toc = booqData?.toc

    return <main className="flex flex-row justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col max-w-4xl w-full p-6 bg-white shadow-lg">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
                <div className="flex justify-center lg:justify-start">
                    <BooqCover
                        title={card.title}
                        author={card.authors.join(', ')}
                        coverUrl={card.coverUrl}
                        size={120}
                    />
                </div>
                
                <div className="flex flex-col flex-1 justify-between">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                            {card.title}
                        </h1>
                        
                        {card.authors.length > 0 && (
                            <div className="text-xl text-gray-600 mb-4">
                                by {card.authors.map((author, index) => (
                                    <span key={author}>
                                        <Link 
                                            href={authorHref({ name: author })}
                                            className="hover:underline text-blue-600 hover:text-blue-800"
                                        >
                                            {author}
                                        </Link>
                                        {index < card.authors.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {card.tags.length > 0 && (
                            <div className="mb-6">
                                <BooqTags tags={card.tags} />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        <Link 
                            href={booqHref({ booqId, path: [0] })}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            Start Reading
                        </Link>
                    </div>
                </div>
            </div>
            
            {toc && toc.items.length > 0 && (
                <div className="border-t border-gray-200 pt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Table of Contents</h2>
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
            <span className="text-gray-700 hover:text-blue-600">
                {item.title || 'Untitled Chapter'}
            </span>
        </Link>
    )
}