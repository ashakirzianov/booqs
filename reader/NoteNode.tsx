import { Popover } from '@/components/Popover'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { MoreIcon } from '@/components/Icons'
import clsx from 'clsx'
import { booqHref } from '@/common/href'
import Link from 'next/link'
import { BooqId } from '@/core'
import { NoteAuthorData, BooqNote } from '@/data/notes'

export function NoteNodeComp({ booqId, note, user }: {
    booqId: BooqId,
    user: NoteAuthorData | undefined,
    note: BooqNote,
}) {
    return <div className='container flex flex-1 justify-between pl-base' style={{
        borderLeft: `3px solid var(--color-${note.kind})`,
    }}>
        <div className='w-full text-primary text-justify'>
            <Link href={booqHref({ booqId, path: note.range.start })} className='text-primary hover:text-highlight'>
                {note.targetQuote}
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
                        setTarget={() => undefined}
                        target={{
                            kind: 'note',
                            noteId: note.id,
                            selection: {
                                range: note.range,
                                text: note.targetQuote,
                            },
                        }}
                    />
                </div>}
            />
            <div className={clsx('mt-base', {
                'hidden': user?.id === note.author.id,
                'flex': user?.id !== note.author.id,
            })} title={note.author.name}>
            </div>
        </div>
    </div>
}