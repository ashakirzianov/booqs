import React, { ReactNode, useState } from 'react';
import { panelShadow, radius, meter, vars } from './theme';
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
    const { body, buttons } = render({ closeModal });
    return {
        openModal, closeModal,
        modalContent: <ModalContent
            isOpen={isOpen}
            content={body}
            buttons={buttons}
            close={closeModal}
        />,
    };
}

function ModalContent({
    isOpen, content, buttons, close,
}: {
    isOpen: boolean,
    close: () => void,
    content: ReactNode,
    buttons?: ButtonProps[],
}) {
    const openClass = isOpen ? 'open' : 'closed';
    return <div className={`screen ${openClass}`} onClick={close}>
        <div
            className={`container ${openClass}`}
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
                transition:  250ms visibility, 250ms background-color;
            }
            .screen.closed {
                visibility: hidden;
                background-color: rgba(0, 0, 0, 0.0);
            }
            .container {
                position: relative;
                max-width: 50rem;
                max-height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                z-index: 10;
                background: var(${vars.background});
                box-shadow: ${panelShadow};
                border-radius: ${radius};
                pointer-events: auto;
                transition: 250ms transform, 250ms opacity;
            }
            .container.closed {
                transform: translateY(-25%);
                opacity: 0;
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
                color: var(${vars.action});
            }
            .container:hover {
                color: var(${vars.highlight});
            }
            .text {
                margin: ${meter.large};
                text-decoration: none;
            }
            hr {
                width: 100%;
                border: none;
                border-top: 1px solid var(${vars.border});
                margin: 0;
            }
            `}</style>
    </div>
}
