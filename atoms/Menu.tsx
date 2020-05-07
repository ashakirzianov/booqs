import React from 'react';
import { IconName, Icon } from './Icon';
import { HasChildren } from './utils';
import { meter } from './meter';
import { usePalette } from './theme';

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

export function MenuItem({ icon, text }: {
    icon?: IconName,
    text: string,
}) {
    const { highlight } = usePalette();
    return <div className='container'>
        {
            icon
                ? <div className="icon"><Icon name={icon} /></div>
                : null
        }
        <span>{text}</span>
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
                color: white;
                background-color: ${highlight};
            }
            .icon {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: ${meter.large};
            }
            `}</style>
    </div>;
}