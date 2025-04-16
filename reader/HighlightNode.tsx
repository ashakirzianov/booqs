import { BooqLink } from '@/components/Links'
import { Popover } from '@/components/Popover'
import { Icon } from '@/components/Icon'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { ProfileBadge } from '@/components/ProfilePicture'
import { colorForGroup } from '@/application/common'
import { ReaderHighlight, ReaderUser } from './common'

export function HighlightNodeComp({ booqId, highlight, self }: {
    booqId: string,
    self: ReaderUser | undefined,
    highlight: ReaderHighlight,
}) {
    const badgeClass = self?.id === highlight.author.id
        ? 'hidden' : 'flex'
    return <div className='container flex flex-1 justify-between pl-base' style={{
        borderLeft: `3px solid ${colorForGroup(highlight.group)}`,
    }}>
        <div className='w-full text-primary text-justify'>
            <BooqLink booqId={booqId} path={highlight.start}>
                {highlight.text}
            </BooqLink>
        </div>
        <div className='flex flex-col justify-between items-stretch ml-lg'>
            <Popover
                placement='right-start'
                hasAction={true}
                anchor={<div className='flex justify-center cursor-pointer text-xl text-dimmed xl:text-background hover:text-highlight w-lg'>
                    <Icon name='more' />
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
            <div className={`${badgeClass} mt-base`} title={highlight.author.name ?? undefined}>
                <ProfileBadge
                    size={1}
                    name={highlight.author.name ?? undefined}
                    picture={undefined}
                    border={false}
                />
            </div>
        </div>
    </div>
}