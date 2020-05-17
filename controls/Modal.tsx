import React, { ReactNode } from 'react';
import { usePalette } from '../app';
import { panelShadow, radius, meter } from './theme';
import { IconButton } from './Buttons';

export function Modal({
    isOpen, close, children,
}: {
    isOpen: boolean,
    close: () => void,
    children: ReactNode,
}) {
    const { background } = usePalette();
    if (!isOpen) {
        return null;
    }
    return <div className='screen' onClick={close}>
        <div
            className='container'
            onClick={e => e.stopPropagation()}
        >
            <div className='close'>
                <IconButton
                    icon='close'
                    onClick={close}
                />
            </div>
            <div className='content'>
                {children}
            </div>
        </div>
        <style jsx>{`
            .screen {
                display: flex;
                flex-direction: column;
                position: fixed;
                top: 0; right: 0; bottom: 0; left: 0;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10;
            }
            .container {
                position: relative;
                max-width: 50rem;
                max-height: 100%;
                overflow-y: scroll;
                overflow-x: hidden;
                z-index: 10;
                background: ${background};
                box-shadow: ${panelShadow};
                border-radius: ${radius};
                pointer-events: auto;
            }
            .close {
                position: absolute;
                top: ${meter.regular};
                right: ${meter.regular};
            }
            `}</style>
    </div>;
}
