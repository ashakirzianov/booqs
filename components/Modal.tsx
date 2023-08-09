import React, { ReactNode } from 'react'
import { Icon, IconName } from './Icon'
import Link from 'next/link'

export function useModal({
    isOpen, setIsOpen, content,
}: {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    content: ReactNode,
}) {
    const closeModal = () => setIsOpen(false)
    return {
        ModalContent: <Modal
            isOpen={isOpen}
            close={closeModal}
        >{content}</Modal>,
    }
}

export function Modal({
    isOpen, children, close,
}: {
    isOpen: boolean,
    close: () => void,
    children: ReactNode,
}) {
    const screenClosedClass = isOpen ? '' : 'invisible bg-transparent'
    const containerClosedClass = isOpen ? '' : 'opacity-0 translate-y-1/4'
    return <div className={`flex flex-col fixed justify-center items-center bg-black/25 z-10 transition-all top-0 right-0 bottom-0 left-0 ${screenClosedClass}`} onClick={close}>
        <div
            className={`relative pointer-events-auto transition duration-300 shadow rounded bg-background ${containerClosedClass}`}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
}


export function ModalLabel({ text }: { text: string }) {
    return <span className='p-lg'>{text}</span>
}

export function ModalDivider() {
    return <hr className='w-full border-b-0 border-l-0 border-r-0 border-t-border border-t m-0' />
}

export function ModalButton({ text, icon, href, onClick }: {
    text: string,
    icon?: IconName,
    href?: string,
    onClick?: () => void,
}) {
    let content = <div className='flex flex-row items-center'>
        {
            icon
                ? <div><Icon name={icon} /></div>
                : null
        }
        <span className='m-lg no-underline'>{text}</span>
    </div>
    return <div className='flex grow flex-col items-center cursor-pointer text-action hover:text-highlight' onClick={onClick}>
        {
            href
                ? <Link href={href}>{content}</Link>
                : content
        }
    </div>
}
