import { BooqPath, BooqRange, BooqNode } from '@/core'
import { BorderButton, PanelButton } from '@/components/Buttons'
import { ReaderLayout } from './ReaderLayout'
import { Augmentation, BooqContent } from '@/viewer'
import { quoteColor } from '@/application/common'
import { BackIcon } from '@/components/Icons'
import Link from 'next/link'
import { booqHref, feedHref } from '@/application/href'

type BooqAnchor = {
    title?: string,
    path: BooqPath,
}
type BooqData = {
    id: string,
    title?: string,
    length: number,
    fragment: {
        nodes: BooqNode[],
        previous?: BooqAnchor,
        current: BooqAnchor,
        next?: BooqAnchor,
    }
}

export function LoadingReader({
    booq, quote,
}: {
    booq: BooqData,
    quote?: BooqRange,
}) {
    const range: BooqRange = {
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path ?? [booq.fragment.nodes.length],
    }
    const augmentations: Augmentation[] = []
    if (quote) {
        augmentations.push({
            range: quote,
            color: quoteColor,
            id: 'quote/0',
        })
    }
    return <ReaderLayout
        isControlsVisible={false}
        isNavigationOpen={false}
        BooqContent={<div style={{
            fontFamily: 'var(--font-book)',
            fontSize: `100%`,
        }}>

            <BooqContent
                booqId={booq.id}
                nodes={booq.fragment.nodes}
                range={range}
                augmentations={augmentations}
            />
        </div>}
        PrevButton={<AnchorButton
            booqId={booq.id}
            anchor={booq.fragment.previous}
            title='Previous'
        />}
        NextButton={<AnchorButton
            booqId={booq.id}
            anchor={booq.fragment.next}
            title='Next'
        />}
        ContextMenu={null}
        Copilot={null}
        MainButton={<Link href={feedHref()}>
            <PanelButton>
                <BackIcon />
            </PanelButton>
        </Link>}
        // TODO: provide some loading indication?
        NavigationButton={null}
        ThemerButton={null}
        AccountButton={null}
        CurrentPage={null}
        PagesLeft={null}
        NavigationContent={null}
    />
}

function AnchorButton({ booqId, anchor, title }: {
    booqId: string,
    anchor?: BooqAnchor,
    title: string,
}) {
    if (!anchor) {
        return null
    }
    return <Link href={booqHref({ id: booqId, path: anchor.path })}>
        <div className='flex items-center h-header'>
            <BorderButton text={anchor.title ?? title} />
        </div>
    </Link>
}
