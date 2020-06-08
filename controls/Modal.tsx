import React, { ReactNode } from 'react';
import { usePalette } from 'app';
import { panelShadow, radius, meter } from './theme';

export function Modal({
    isOpen, close, children, buttons,
}: {
    isOpen: boolean,
    close: () => void,
    children: ReactNode,
    buttons?: ButtonProps[],
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
            <div className='content'>
                {children}
            </div>
            <div className='buttons'>
                {
                    (buttons ?? []).map(
                        (props, idx) => <ModalButton key={idx} {...props} />
                    )
                }
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
            `}</style>
    </div>;
}

type ButtonProps = {
    text: string,
    onClick: () => void,
};
function ModalButton({ text, onClick }: ButtonProps) {
    const { border, action, highlight } = usePalette();
    return <div className='container' onClick={onClick}>
        <hr />
        <span className='text'>{text}</span>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
                cursor: pointer;
                color: ${action};
            }
            .container:hover {
                color: ${highlight};
            }
            .text {
                margin: ${meter.large};
            }
            hr {
                width: 100%;
                border: none;
                border-top: 1px solid ${border};
                margin: 0;
            }
            `}</style>
    </div>
}
