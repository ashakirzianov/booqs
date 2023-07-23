import React, { ReactNode, ReactElement } from 'react'
import { roundArrow } from 'tippy.js'
import Tippy, { useSingleton } from '@tippyjs/react'
import css from 'styled-jsx/css'
import { radius } from './theme'

export type PopoverSingleton = ReturnType<typeof useSingleton>[1];

// TODO: combine 'Popover' & 'Overlay' ?
export function Overlay({
    anchor, content, placement, visible, hideOnClick,
}: {
    anchor: ReactElement,
    content: ReactNode,
    placement: 'bottom' | 'right-start',
    visible?: boolean,
    hideOnClick?: boolean,
}) {
    return <>
        <Tippy
            popperOptions={{ strategy: 'fixed' }}
            arrow={false}
            interactive={true}
            placement={placement ?? 'bottom'}
            visible={visible}
            hideOnClick={hideOnClick}
            animation='shift-away'
            content={<div>{content}</div>}
            children={anchor}
            className='overlay-theme'
        />
        <style jsx global>{overlayStyles}</style>
    </>
}

// TODO: rethink div wrapping
export function Popover({ singleton, anchor, content }: {
    singleton?: PopoverSingleton,
    anchor: ReactNode,
    content: ReactNode,
}) {
    return <div>
        <Tippy
            singleton={singleton}
            className='popover-theme'
            content={<div className='content'>
                {content}
            </div>}
            children={<div>{anchor}</div>}
        />
        <style jsx>{`
            .content {
                display: flex;
                min-width: 15rem;
                flex: 1;
            }
        `}</style>
    </div>
}

export function usePopoverSingleton() {
    const [source, target] = useSingleton()
    const SingletonNode = <>
        <Tippy
            singleton={source}
            className='popover-theme'
            popperOptions={{ strategy: 'fixed' }}
            arrow={roundArrow + roundArrow}
            placement='bottom'
            interactive={true}
            hideOnClick={true}
            animation='shift-away'
        />
        <style jsx global>{popoverStyles}</style>
    </>
    return {
        SingletonNode,
        singleton: target,
    }
}

const popoverStyles = css.global`
.tippy-box.popover-theme {
    color: var(--theme-primary);
    background-color: var(--theme-background);
    box-shadow: 0px 0px 5px rgba(0,0,0,0.1);
    border: 1px solid var(--theme-border);
    border-radius: ${radius};
}
.popover-theme .tippy-content {
    padding: 0;
    overflow: hidden;
    border-radius: ${radius};
}
.popover-theme .tippy-svg-arrow > svg:first-child {
    fill: var(--theme-border);
}
.popover-theme .tippy-svg-arrow > svg:last-child {
    fill: var(--theme-background);
}
`

const overlayStyles = css.global`
.tippy-box.overlay-theme {
    color: var(--theme-primary);
    background-color: var(--theme-background);
    box-shadow: unset;
    border: unset;
}
.overlay-theme > .tippy-content {
    padding: 0;
    overflow: hidden;
    box-shadow: 0px 0px 20px rgba(0,0,0,0.2);
    border-radius: ${radius};
}
`
