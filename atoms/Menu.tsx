import React from 'react';
import { IconName, Icon } from './Icon';
import { HasChildren } from './utils';
import { meter } from './meter';
import { usePalette } from './theme';

export function Menu({ children }: HasChildren) {
    return <div>
        {children}
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
                ? <div><Icon name={icon} /></div>
                : null
        }
        <span>{text}</span>
        <style jsx>{`
            .container {
                display: flex;
                width: 100%;
                flex-direction: row;
                align-items: center;
                padding: ${meter.regular};
                cursor: pointer;
                font-size: large;
            }
            .container:hover {
                color: white;
                background-color: ${highlight};
            }
            div {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: ${meter.regular};
            }
            `}</style>
    </div>;
}