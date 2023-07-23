import React, { ReactNode } from 'react'
import { IconName, Icon } from './Icon'
import { meter } from './theme'
import { Spinner } from './Spinner'

export function Menu({ callback, children }: {
    children: ReactNode,
    callback?: () => void,
}) {
    return <div onClick={callback}>
        {children}
        <style jsx>{`
            div {
                display: flex;
                flex-direction: column;
                align-items: stretch;
                flex: 1;
            }
            `}</style>
    </div>
}

export function MenuItem({ icon, text, callback, spinner }: {
    text: string,
    icon?: IconName,
    callback?: () => void,
    spinner?: boolean,
}) {
    return <div
        className='container font-bold'
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback}
    >
        {
            icon
                ? <div className="icon"><Icon name={icon} /></div>
                : null
        }
        <span className='text'>{text}</span>
        {
            spinner
                ? <div className='spinner'><Spinner /></div>
                : null
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                padding: ${meter.large};
                cursor: pointer;
                font-family: var(--font-main);
                user-select: none;
                transition: 250ms color, 250ms background-color;
            }
            .container:hover {
                color: var(--theme-background);
                background-color: var(--theme-highlight);
            }
            .icon {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: ${meter.large};
            }
            .text {
                display: flex;
                flex: 1;
            }
            .spinner {
                display: flex;
                flex: 0;
            }
            `}</style>
    </div>
}