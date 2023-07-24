import React, { ReactNode, ReactElement } from 'react'
import { roundArrow } from 'tippy.js'
import Tippy, { useSingleton } from '@tippyjs/react'
import css from 'styled-jsx/css'

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
            content={<div className='flex min-w-[15rem] grow'>
                {content}
            </div>}
            children={<div>{anchor}</div>}
        />
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
    </>
    return {
        SingletonNode,
        singleton: target,
    }
}