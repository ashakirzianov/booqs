import { Highlight, colorForGroup } from "app";
import { isSmallScreen, meter, vars, boldWeight } from "controls/theme";
import { BooqLink } from "controls/Links";
import { Overlay } from "controls/Popover";
import { Icon } from "controls/Icon";
import { ContextMenuContent } from "reader/ContextMenuContent";
import { ProfileBadge } from "controls/ProfilePicture";

export function HighlightNodeComp({ booqId, highlight }: {
    booqId: string,
    highlight: Highlight,
}) {
    const smallScreen = isSmallScreen();
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
                anchor={<div className='more'>
                    <Icon name='more' />
                </div>}
                content={<div className='menu'>
                    <ContextMenuContent
                        booqId={booqId}
                        setTarget={() => undefined}
                        target={{
                            kind: 'highlight',
                            highlight,
                        }}
                    />
                </div>}
            />
            <div className='badge'>
                <ProfileBadge
                    size={16}
                    name={highlight.author.name}
                    picture={highlight.author.pictureUrl ?? undefined}
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
                color: var(${vars.primary});
                text-align: justify;
            }
            .badge {
                margin-top: ${meter.regular};
            }
            .side {
                display: flex;
                flex-flow: column;
                justify-content: space-between;
                align-items: stretch;
                margin-left: ${meter.large};
            }
            .page {
                margin-top: ${meter.regular};
                font-weight: ${boldWeight};
            }
            .container:hover .more {
                color: var(${vars.dimmed});
            }
            .more {
                display: flex;
                justify-content: center;
                cursor: pointer;
                font-size: x-large;
                color: ${smallScreen ? `var(${vars.dimmed})` : `var(${vars.background})`};
                width: ${meter.large};
            }
            .more:hover {
                color: var(${vars.highlight});
            }
            .menu {
                width: 12rem;
                pointer-events: auto;
            }
            `}</style>
    </div>;
}