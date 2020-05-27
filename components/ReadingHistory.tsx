import React from 'react';
import { BooqPreview } from "controls/BooqPreview";
import { meter } from "controls/theme";
import { useHistory, pageForPosition, useAuth } from "app";
import { FacebookSignButton } from './SignIn';

const historyPanelHeight = '15em';
export function ReadingHistory() {
    const { state } = useAuth();
    const { history } = useHistory();
    return <div className='row'>
        <div className='column'>
            {
                state !== 'signed' ? <SignInPanel />
                    : !history.length ? <EmptyHistory />
                        : <HistoryItems items={history} />
            }
        </div>
        <style jsx>{`
            .row {
                display: flex;
                flex-flow: row;
                align-items: center;
                justify-content: center;
                height: ${historyPanelHeight};
            }
            .column {
                display: flex;
                flex-flow: column;
                align-items: center;
            }
            `}</style>
    </div>
}

function SignInPanel() {
    return <>
        <span>Sign in to see history</span>
        <FacebookSignButton />
        <style jsx>{`
            span {
                margin-bottom: ${meter.large};
                font-weight: bold;
            }
            `}</style>
    </>;
}

function EmptyHistory() {
    return <>
        <span>Your reading history will appear here</span>
        <style jsx>{`
            span {
                font-weight: bold;
            }
            `}</style>
    </>;
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
                        <BooqPreview
                            path={entry.path}
                            text={entry.preview}
                            title={entry.title ?? ''}
                            page={pageForPosition(entry.position)}
                            total={pageForPosition(entry.length)}
                        />
                    </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 1;
                flex-direction: row;
                box-sizing: border-box;
                padding: ${meter.xLarge} 25vw;
                overflow: scroll;
                scroll-snap-type: x mandatory;
            }
            .preview {
                display: flex;
                padding: 0 ${meter.large};
                scroll-snap-align: center;
            }
            `}</style>
    </div>
}