import { Popover } from '@/components/Popover'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { resolveHighlightColor } from '@/application/common'
import { ReaderHighlight, ReaderUser } from './common'
import { MoreIcon } from '@/components/Icons'
import clsx from 'clsx'
import { booqHref } from '@/components/Links'
import Link from 'next/link'

export function HighlightNodeComp({ booqId, highlight, self }: {
    booqId: string,
    self: ReaderUser | undefined,
    highlight: ReaderHighlight,
}) {
    return <div className='container flex flex-1 justify-between pl-base' style={{
        borderLeft: `3px solid ${resolveHighlightColor(highlight.color)}`,
    }}>
        <div className='w-full text-primary text-justify'>
            <Link href={booqHref({ id: booqId, path: highlight.start })} className='text-primary hover:text-highlight'>
                {highlight.text}
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
                        self={self}
                        setTarget={() => undefined}
                        target={{
                            kind: 'highlight',
                            highlight,
                        }}
                    />
                </div>}
            />
            <div className={clsx('mt-base', {
                'hidden': self?.id === highlight.author.id,
                'flex': self?.id !== highlight.author.id,
            })} title={highlight.author.name ?? undefined}>
            </div>
        </div>
    </div>
}