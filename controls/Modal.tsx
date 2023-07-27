import React, { ReactNode, useState } from 'react'
import Link from 'next/link'
import { Icon, IconName } from './Icon'

export type ModalDefinition = {
    body: ReactNode,
    buttons?: ButtonProps[],
};
export type ModalRenderProps = {
    closeModal: () => void,
};
export function useModal(render: (props: ModalRenderProps) => ModalDefinition) {
    const [isOpen, setIsOpen] = useState(false)
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    const { body, buttons } = render({ closeModal })
    return {
        openModal, closeModal,
        ModalContent: <ModalContent
            isOpen={isOpen}
            content={body}
            buttons={buttons}
            close={closeModal}
        />,
    }
}

function ModalContent({
    isOpen, content, buttons, close,
}: {
    isOpen: boolean,
    close: () => void,
    content: ReactNode,
    buttons?: ButtonProps[],
}) {
    const openClass = isOpen ? 'open' : 'closed'
    const screenClosedClass = isOpen ? '' : 'invisible bg-transparent'
    const containerClosedClass = isOpen ? '' : 'opacity-0 translate-y-1/4'
    return <div className={`flex flex-col fixed justify-center items-center bg-black/25 z-10 transition-all top-0 right-0 bottom-0 left-0 ${screenClosedClass}`} onClick={close}>
        <div
            className={`relative max-w-3xl w-auto max-h-full overflow-x-hidden overflow-y-auto z-10 bg-background pointer-events-auto transition duration-300 shadow rounded ${containerClosedClass}`}
            onClick={e => e.stopPropagation()}
        >
            <div>
                {content}
            </div>
            <div>
                {
                    (buttons ?? []).map(
                        (props, idx) => <ModalButton key={idx} {...props} />
                    )
                }
            </div>
        </div>
    </div>
}

type ButtonProps = {
    text: string,
    icon?: IconName,
    onClick?: () => void,
    href?: string,
};
function ModalButton({ text, icon, onClick, href }: ButtonProps) {
    const Content = <div className='flex flex-row items-center'>
        {
            icon
                ? <div><Icon name={icon} /></div>
                : null
        }
        <span className='m-lg no-underline'>{text}</span>
    </div>
    return <div className='flex grow flex-col items-center cursor-pointer text-action hover:text-highlight' onClick={onClick}>
        <hr className='w-full border-b-0 border-l-0 border-r-0 border-t-border border-t m-0' />
        {
            href
                ? <Link href={href}>
                    {Content}
                </Link>
                : Content
        }
    </div>
}
