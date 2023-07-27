'use client'
import React from 'react'
import { BooqPreview } from '@/controls/BooqPreview'
import { BooqLink } from '@/controls/Links'
import { useSignInModal } from './SignIn'
import { useAuth } from '@/application/auth'
import { useHistory } from '@/application/history'
import { pageForPosition } from '@/application/common'

export default function ReadingHistory() {
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
    return <div className='flex flex-col items-center justify-center h-60'>
        <span className='font-bold mb-lg'>
            <span className='cursor-pointer underline decoration-2 text-action hover:text-highlight' onClick={openModal}>Sign in</span> to see history
        </span>
        {ModalContent}
    </div>
}

function EmptyHistory() {
    return <div className='flex flex-col items-center justify-center h-60'>
        <span className='font-bold'>Your reading history will appear here</span>
    </div>
}

type HistoryItem = ReturnType<typeof useHistory>['history'][number];
function HistoryItems({ items }: {
    items: HistoryItem[],
}) {
    return <div className='flex flex-1 box-border overflow-auto snap-x py-xl px-base' style={{
        scrollbarWidth: 'none',
    }}>
        {
            items.map(
                (entry, idx) =>
                    <div key={idx} className='flex snap-center py-0 px-lg'>
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
    </div>
}