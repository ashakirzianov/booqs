import React, { ReactNode } from 'react';
import { usePalette } from '../app';
import { panelShadow, radius } from './theme';
import { IconButton } from './Buttons';

export function Modal({
    isOpen, close, children,
}: {
    isOpen: boolean,
    close: () => void,
    children: ReactNode,
}) {
    const { primary } = usePalette();
    if (!isOpen) {
        return null;
    }
    return <div className='screen' onClick={close}>
        <div
            className='modal'
            onClick={e => e.stopPropagation()}
        >
            <div className='close'>
                <IconButton
                    icon='close'
                    callback={close}
                />
            </div>
            <div style={{
                flexGrow: 1,
                flexShrink: 1,
                overflow: 'scroll',
                justifyContent: 'flex-start',
            }}
            >
                {children}
            </div>
        </div>
        <style jsx>{`
            .screen {
                display: flex;
                flex-direction: column;
                position: fixed;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10;
            }
            .modal {
                display: flex;
                flex-direction: column;
                flex: 1 1;
                width: 100%;
                max-width: 50rem;
                max-height: 100%;
                overflow: scroll;
                z-index: 10;
                background: ${primary};
                box-shadow: ${panelShadow};
                border-radius: ${radius};
                pointer-events: auto;
            }
            .close {
                float: right;
            }
            `}</style>
    </div>;
}
