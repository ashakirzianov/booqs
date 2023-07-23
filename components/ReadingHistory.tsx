import React from 'react'
import { useHistory, pageForPosition, useAuth } from '@/application'
import { BooqPreview } from '@/controls/BooqPreview'
import { meter } from '@/controls/theme'
import { BooqLink } from '@/controls/Links'
import { useSignInModal } from './SignIn'

const historyPanelHeight = '15em'
export function ReadingHistory() {
    const { signed } = useAuth() ?? {}
    const { history } = useHistory()
    if (!signed) {
        return <SignInPanel />
    } else if (!history.length) {
        return <EmptyHistory />
    } else {
        return <HistoryItems items={history} />
    }
}

function SignInPanel() {
    const { openModal, ModalContent } = useSignInModal()
    return <div className='container'>
        <span className='label'>
            <span className='sign-in-link' onClick={openModal}>Sign in</span> to see history
        </span>
        {ModalContent}
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: column;
                align-items: center;
                justify-content: center;
                height: ${historyPanelHeight};
            }
            .label {
                margin-bottom: ${meter.large};
                font-weight: bold;
            }
            .sign-in-link {
                cursor: pointer;
                text-decoration: 2px underline;
                color: var(--theme-action);
            }
            .sign-in-link:hover {
                color: var(--theme-highlight);
            }
            `}</style>
    </div>
}

function EmptyHistory() {
    return <div className='container'>
        <span>Your reading history will appear here</span>
        <style jsx>{`
            .container {
                display: flex;
                flex-flow: column;
                align-items: center;
                justify-content: center;
                height: ${historyPanelHeight};
            }
            span {
                font-weight: bold;
            }
            `}</style>
    </div>
}

type HistoryItem = ReturnType<typeof useHistory>['history'][number];
function HistoryItems({ items }: {
    items: HistoryItem[],
}) {
    return <div className='container'>
        {
            items.map(
                (entry, idx) =>
                    <div key={idx} className='preview'>
                        <BooqLink booqId={entry.id} path={entry.path}>
                            <BooqPreview
                                path={entry.path}
                                text={entry.preview}
                                title={entry.title ?? ''}
                                page={pageForPosition(entry.position)}
                                total={pageForPosition(entry.length)}
                            />
                        </BooqLink>
                    </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 1;
                flex-direction: row;
                box-sizing: border-box;
                padding: ${meter.xLarge} ${meter.regular};
                overflow: auto;
                scroll-snap-type: x mandatory;
                scrollbar-width: none;
            }
            .container::-webkit-scrollbar {
                display: none;
            }
            .preview {
                display: flex;
                padding: 0 ${meter.large};
                scroll-snap-align: center;
            }
            `}</style>
    </div>
}