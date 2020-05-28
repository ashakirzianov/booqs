import React from 'react';
import { usePalette } from 'app';
import { IconName, Icon } from './Icon';
import { HasChildren } from './utils';
import { meter } from './theme';
import { Spinner } from './Spinner';

export function Menu({ children }: HasChildren) {
    return <div>
        {children}
        <style jsx>{`
            div {
                display: flex;
                flex-direction: column;
                align-items: stretch;
                flex: 1;
            }
            `}</style>
    </div>;
}

export function MenuItem({ icon, text, callback, spinner }: {
    text: string,
    icon?: IconName,
    callback?: () => void,
    spinner?: boolean,
}) {
    const { highlight, background } = usePalette();
    return <div className='container' onClick={callback}>
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
                font-size: large;
            }
            .container:hover {
                color: ${background};
                background-color: ${highlight};
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
    </div>;
}