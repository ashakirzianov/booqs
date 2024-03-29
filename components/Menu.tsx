import React, { ReactNode } from 'react'
import { IconName, Icon } from './Icon'
import { Spinner } from './Loading'
import Link from 'next/link'

export function Menu({ callback, children }: {
    children: ReactNode,
    callback?: () => void,
}) {
    return <div onClick={callback} className='flex flex-col items-stretch grow'>
        {children}
    </div>
}

export function MenuItem({
    icon, text, callback, spinner, href,
}: {
    text: string,
    icon?: IconName,
    callback?: () => void,
    spinner?: boolean,
    href?: string,
}) {
    let content = <div
        className='container flex flex-row grow items-center cursor-pointer font-main select-none transition font-bold p-lg hover:bg-highlight hover:text-background'
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback}
    >
        {
            icon
                ? <div className="flex justify-center items-center mr-lg"><Icon name={icon} /></div>
                : null
        }
        <span className='flex grow'>{text}</span>
        {
            spinner
                ? <div className='flex grow-0'><Spinner /></div>
                : null
        }
    </div>
    return href
        ? <Link href={href}>{content}</Link>
        : content
}