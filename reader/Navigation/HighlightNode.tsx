import { BooqLink } from '@/controls/Links'
import { Popover } from '@/controls/Popover'
import { Icon } from '@/controls/Icon'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { ProfileBadge } from '@/controls/ProfilePicture'
import { Highlight } from '@/application/highlights'
import { UserInfo } from '@/application/auth'
import { colorForGroup } from '@/application/common'

export function HighlightNodeComp({ booqId, highlight, self }: {
    booqId: string,
    self: UserInfo | undefined,
    highlight: Highlight,
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
            <div className={`${badgeClass} mt-base`} title={highlight.author.name}>
                <ProfileBadge
                    size={1}
                    name={highlight.author.name}
                    picture={undefined}
                    border={false}
                />
            </div>
        </div>
    </div>
}