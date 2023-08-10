'use client'
import React, { ReactNode } from 'react'
import { BooqPreview } from '@/components/BooqPreview'
import { BooqLink } from '@/components/Links'
import { useSignInModal } from './SignIn'
import { useAuth } from '@/application/auth'
import { useHistory } from '@/application/history'
import { pageForPosition } from '@/application/common'
import { useIsMounted } from '@/application/utils'
import { Ellipsis } from './Loading'

export default function ReadingHistory() {
    const { signed } = useAuth() ?? {}
    const { history } = useHistory()
    const mounted = useIsMounted()
    if (!mounted) {
        return <Panel><Ellipsis /></Panel>
    } else if (!signed) {
        return <SignInPanel />
    } else if (!history.length) {
        return <Panel>
            <span className='font-bold'>Your reading history will appear here</span>
        </Panel>
    } else {
        return <HistoryItems items={history} />
    }
}

function SignInPanel() {
    const { openModal, ModalContent } = useSignInModal()
    return <Panel>
        <span className='font-bold mb-lg'>
            <span className='cursor-pointer underline decoration-2 text-action hover:text-highlight' onClick={openModal}>Sign in</span> to see history
        </span>
        {ModalContent}
    </Panel>
}

function Panel({ children }: {
    children: ReactNode,
}) {
    return <div className='flex flex-col items-center justify-center h-60'>
        {children}
    </div>
}

type HistoryItem = ReturnType<typeof useHistory>['history'][number];
function HistoryItems({ items }: {
    items: HistoryItem[],
}) {
    return <div className='flex flex-1 gap-3 box-border overflow-auto snap-x snap-mandatory py-xl px-base' style={{
        scrollbarWidth: 'none',
    }}>
        {
            items.map(
                (entry, idx) =>
                    <div key={idx} className='flex snap-center'>
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