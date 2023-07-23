import { Highlight, colorForGroup, UserInfo } from '@/application'
import { meter } from '@/controls/theme'
import { BooqLink } from '@/controls/Links'
import { Overlay } from '@/controls/Popover'
import { Icon } from '@/controls/Icon'
import { ContextMenuContent } from '@/reader/ContextMenuContent'
import { ProfileBadge } from '@/controls/ProfilePicture'

export function HighlightNodeComp({ booqId, highlight, self }: {
    booqId: string,
    self: UserInfo | undefined,
    highlight: Highlight,
}) {
    return <div className='container'>
        <div className='content'>
            <BooqLink booqId={booqId} path={highlight.start}>
                {highlight.text}
            </BooqLink>
        </div>
        <div className='side'>
            <Overlay
                placement='right-start'
                hideOnClick={true}
                anchor={<div className='more text-dimmed xl:text-background hover:text-highlight'>
                    <Icon name='more' />
                </div>}
                content={<div className='menu'>
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
            <div className='badge' title={highlight.author.name}>
                <ProfileBadge
                    size={1}
                    name={highlight.author.name}
                    picture={undefined}
                    border={false}
                />
            </div>
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: row;
                justify-content: space-between;
                border-left: 3px solid ${colorForGroup(highlight.group)};
                padding-left: ${meter.regular};
            }
            .container:hover {
            }
            .content {
                width: 100%;
                color: var(--theme-primary);
                text-align: justify;
            }
            .badge {
                display: ${self?.id === highlight.author.id ? 'none' : 'flex'};
                margin-top: ${meter.regular};
            }
            .side {
                display: flex;
                flex-flow: column;
                justify-content: space-between;
                align-items: stretch;
                margin-left: ${meter.large};
            }
            .container:hover .more {
                color: var(--theme-dimmed);
            }
            .more {
                display: flex;
                justify-content: center;
                cursor: pointer;
                font-size: x-large;
                width: ${meter.large};
            }
            .menu {
                width: 12rem;
                pointer-events: auto;
            }
            `}</style>
    </div>
}