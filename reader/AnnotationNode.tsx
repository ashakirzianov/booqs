import { Popover } from '@/components/Popover'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { MoreIcon } from '@/components/Icons'
import clsx from 'clsx'
import { booqContentHref } from '@/common/href'
import Link from 'next/link'
import { BooqId } from '@/core'
import { AnnotationAuthorData, BooqAnnotation } from '@/data/annotations'

export function AnnotationNodeComp({ booqId, annotation, user }: {
    booqId: BooqId,
    user: AnnotationAuthorData | undefined,
    annotation: BooqAnnotation,
}) {
    return <div className='container flex flex-1 justify-between pl-base' style={{
        borderLeft: `3px solid var(--color-${annotation.kind})`,
    }}>
        <div className='w-full text-primary text-justify'>
            <Link href={booqContentHref({ booqId, path: annotation.range.start })} className='text-primary hover:text-highlight'>
                {annotation.targetQuote}
            </Link>
        </div>
        <div className='flex flex-col justify-between items-stretch ml-lg'>
            <Popover
                placement='right-start'
                hasAction={true}
                anchor={<div className='flex justify-center cursor-pointer text-xl text-dimmed xl:text-background hover:text-highlight w-lg'>
                    <MoreIcon />
                </div>}
                content={<div className='w-48 pointer-events-auto text-primary'>
                    <ContextMenuContent
                        booqId={booqId}
                        user={user}
                        setMenuState={() => undefined}
                        target={{
                            kind: 'annotation',
                            annotationId: annotation.id,
                            selection: {
                                range: annotation.range,
                                text: annotation.targetQuote,
                                prefix: '',
                                suffix: '',
                            },
                        }}
                    />
                </div>}
            />
            <div className={clsx('mt-base', {
                'hidden': user?.id === annotation.author.id,
                'flex': user?.id !== annotation.author.id,
            })} title={annotation.author.name}>
            </div>
        </div>
    </div>
}
