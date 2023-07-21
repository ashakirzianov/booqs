import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import * as clipboard from 'clipboard-polyfill'
import { BooqRange } from 'core'
import {
    useHighlightMutations, Highlight, colorForGroup, groups, UserData,
} from 'app'
import { MenuItem } from 'controls/Menu'
import { useDocumentEvent } from 'controls/utils'
import { quoteRef } from 'controls/Links'
import { BooqSelection } from './BooqContent'
import { meter, menuFont, boldWeight } from 'controls/theme'
import { ProfileBadge } from 'controls/ProfilePicture'

type EmptyTarget = {
    kind: 'empty',
};
type SelectionTarget = {
    kind: 'selection',
    selection: BooqSelection,
};
type QuoteTarget = {
    kind: 'quote',
    selection: BooqSelection,
};
type HighlightTarget = {
    kind: 'highlight',
    highlight: Highlight,
};
export type ContextMenuTarget =
    | EmptyTarget | SelectionTarget | QuoteTarget | HighlightTarget;

export function ContextMenuContent({
    target, ...rest
}: {
    target: ContextMenuTarget,
    booqId: string,
    self: UserData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    switch (target.kind) {
        case 'selection':
            return <SelectionTargetMenu target={target} {...rest} />
        case 'quote':
            return <QuoteTargetMenu target={target} {...rest} />
        case 'highlight':
            return <HighlightTargetMenu target={target} {...rest} />
        default:
            return null
    }
}

function SelectionTargetMenu({
    target: { selection }, ...rest
}: {
    target: SelectionTarget,
    booqId: string,
    self: UserData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    useCopyQuote(rest.booqId, selection)
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>
}

function QuoteTargetMenu({
    target: { selection }, ...rest
}: {
    target: QuoteTarget,
    booqId: string,
    self: UserData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <>
        <AddHighlightItem {...rest} selection={selection} />
        <CopyTextItem {...rest} selection={selection} />
    </>
}

function HighlightTargetMenu({
    target: { highlight }, self, ...rest
}: {
    target: HighlightTarget,
    booqId: string,
    self: UserData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const isOwnHighlight = self?.id === highlight.author.id
    const selection = {
        range: {
            start: highlight.start,
            end: highlight.end,
        },
        text: highlight.text,
    }
    return <>
        {isOwnHighlight ? null :
            <AuthorItem
                name={highlight.author.name}
                pictureUrl={highlight.author.pictureUrl ?? undefined}
            />
        }
        {!isOwnHighlight ? null :
            <SelectHighlightGroupItem  {...rest} highlight={highlight} />
        }
        {!isOwnHighlight ? null :
            <RemoveHighlightItem  {...rest} highlight={highlight} />
        }
        <CopyQuoteItem {...rest} selection={selection} />
        <CopyLinkItem {...rest} selection={selection} />
    </>
}

function AuthorItem({ name, pictureUrl }: {
    name?: string,
    pictureUrl?: string,
}) {
    return <div className='container'>
        {
            pictureUrl
                ? <div className="picture">
                    <ProfileBadge
                        border={false}
                        size={1.5}
                        name={name}
                        picture={pictureUrl}
                    />
                </div>
                : null
        }
        <span className='name'>{name ?? 'Incognito'}</span>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                padding: ${meter.large};
                font-size: smaller;
                font-family: ${menuFont};
                font-weight: ${boldWeight};
                user-select: none;
            }
            .picture {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: ${meter.large};
            }
            .name {
                display: flex;
                flex: 1;
            }
            `}</style>
    </div>
}

function AddHighlightItem({
    selection, booqId, self, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    self: UserData | undefined,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { addHighlight } = useHighlightMutations(booqId)
    if (!self?.id) {
        return null
    }
    return <div className='container'>
        {
            groups.map(
                (group, idx) => <GroupSelectionButton
                    key={idx}
                    selected={false}
                    color={colorForGroup(group)}
                    callback={() => {
                        const highlight = addHighlight({
                            group,
                            start: selection.range.start,
                            end: selection.range.end ?? selection.range.start,
                            text: selection.text,
                            author: self,
                        })
                        setTarget({
                            kind: 'highlight',
                            highlight,
                        })
                        removeSelection()
                    }}
                />,
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: stretch;
                justify-content: space-between;
                cursor: pointer;
                font-size: small;
                user-select: none;
            }
            `}</style>
    </div>
}

function RemoveHighlightItem({
    highlight, booqId, setTarget,
}: {
    highlight: Highlight,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { removeHighlight } = useHighlightMutations(booqId)
    return <MenuItem
        text='Remove'
        icon='remove'
        callback={() => {
            removeHighlight(highlight.id)
            setTarget({ kind: 'empty' })
        }}
    />
}

function SelectHighlightGroupItem({
    highlight, booqId, setTarget,
}: {
    highlight: Highlight,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { updateHighlight } = useHighlightMutations(booqId)
    return <div className='container'>
        {
            groups.map(
                (group, idx) => <GroupSelectionButton
                    key={idx}
                    selected={group === highlight.group}
                    color={colorForGroup(group)}
                    callback={() => {
                        updateHighlight(highlight.id, group)
                        // Note: hackie way of updating selection
                        setTarget({
                            kind: 'highlight',
                            highlight: {
                                ...highlight,
                                group,
                            },
                        })
                    }}
                />,
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: stretch;
                justify-content: space-between;
                cursor: pointer;
                font-size: small;
                user-select: none;
            }
            `}</style>
    </div>
}

function GroupSelectionButton({ color, selected, callback }: {
    selected: boolean,
    color: string,
    callback: () => void,
}) {
    return <div
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback} className='button'>
        <style jsx>{`
            .button {
                display: flex;
                flex: 1;
                align-self: stretch;
                background: ${color};
                color: rgba(0, 0, 0, 0);
                cursor: pointer;
                border-bottom: 0.5rem solid ${selected ? `${color}` : `rgba(0,0,0,0)`};
                height: 2.5rem;
                transition: 250ms border;
            }
            .button:hover {
                border-bottom: 0.5rem solid ${color};
            }
            `}</style>
    </div>
}

function CopyQuoteItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { prefetch } = useRouter()
    return <MenuItem
        text='Copy quote'
        icon='quote'
        callback={() => {
            const quote = generateQuote(booqId, selection.text, selection.range)
            clipboard.writeText(quote)
            removeSelection()
            prefetch(quoteRef(booqId, selection.range))
            setTarget({ kind: 'empty' })
        }}
    />
}

function CopyTextItem({
    selection, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    return <MenuItem
        text='Copy text'
        icon='copy'
        callback={() => {
            const text = selection.text
            clipboard.writeText(text)
            removeSelection()
            setTarget({ kind: 'empty' })
        }}
    />
}

function CopyLinkItem({
    selection, booqId, setTarget,
}: {
    selection: BooqSelection,
    booqId: string,
    setTarget: (target: ContextMenuTarget) => void,
}) {
    const { prefetch } = useRouter()
    return <MenuItem
        text='Copy link'
        icon='link'
        callback={() => {
            const link = generateLink(booqId, selection.range)
            clipboard.writeText(link)
            removeSelection()
            prefetch(quoteRef(booqId, selection.range))
            setTarget({ kind: 'empty' })
        }}
    />
}

function useCopyQuote(booqId: string, selection?: BooqSelection) {
    const { prefetch } = useRouter()
    useDocumentEvent('copy', useCallback(e => {
        if (selection && e.clipboardData) {
            e.preventDefault()
            const selectionText = generateQuote(booqId, selection.text, selection.range)
            e.clipboardData.setData('text/plain', selectionText)
            prefetch(quoteRef(booqId, selection.range))
        }
    }, [selection, booqId, prefetch]))
}

function removeSelection() {
    window.getSelection()?.empty()
}

function generateQuote(booqId: string, text: string, range: BooqRange) {
    const link = generateLink(booqId, range)
    return `"${text}"\n${link}`
}

function generateLink(booqId: string, range: BooqRange) {
    return `${baseUrl()}${quoteRef(booqId, range)}`
}

function baseUrl() {
    const current = window.location
    return `${current.protocol}//${current.host}`
}
