import React, { ReactNode, useState } from 'react';
import { usePalette } from 'app';
import { panelShadow, radius, meter } from './theme';
import Link from 'next/link';

export type ModalDefinition = {
    body: ReactNode,
    buttons?: ButtonProps[],
};
export type ModalRenderProps = {
    closeModal: () => void,
};
export function useModal(render: (props: ModalRenderProps) => ModalDefinition) {
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    if (isOpen) {
        const { body, buttons } = render({ closeModal });
        return {
            openModal, closeModal,
            modalContent: <ModalContent
                content={body}
                buttons={buttons}
                close={closeModal}
            />,
        };
    } else {
        return {
            openModal, closeModal, modalContent: null,
        };
    }
}

function ModalContent({
    content, buttons, close,
}: {
    close: () => void,
    content: ReactNode,
    buttons?: ButtonProps[],
}) {
    const { background } = usePalette();
    return <div className='screen' onClick={close}>
        <div
            className='container'
            onClick={e => e.stopPropagation()}
        >
            <div className='content'>
                {content}
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
                background: rgba(0, 0, 0, 0.25);
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
    onClick?: () => void,
    href?: string,
};
function ModalButton({ text, onClick, href }: ButtonProps) {
    const { border, action, highlight } = usePalette();
    return <div className='container' onClick={onClick}>
        <hr />
        {
            href
                ? <Link href={href}>
                    <span className='text'>{text}</span>
                </Link>
                : <span className='text'>{text}</span>
        }
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
                text-decoration: none;
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
