'use client'
import React, { ReactNode, useEffect, useRef } from 'react'
import { Icon, IconName } from './Icon'
import Link from 'next/link'

export function useModal({
    isOpen, setIsOpen, content
}: {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    content: ReactNode,
}) {
    return {
        ModalContent: <Modal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
        >{content}</Modal>,
    }
}

export function Modal({
    isOpen, children, closeModal, fullScreen,
}: {
    isOpen: boolean,
    fullScreen?: boolean,
    closeModal: () => void,
    children: ReactNode,
}) {
    const fullScreenClasses = fullScreen ? 'w-screen h-screen m-0' : ''
    const dialogRef = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        let ref: HTMLDialogElement | null = null
        if (isOpen) {
            dialogRef.current?.showModal()
            ref = dialogRef.current
        } else {
            dialogRef.current?.close()
        }
        return () => {
            ref?.close()
        }
    }, [isOpen])
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (e.target === dialogRef.current) {
                closeModal()
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeModal()
            }
        }
        document.addEventListener('keydown', handleKey)
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.removeEventListener('mousedown', handleClick)
        }
    }, [closeModal])
    return <dialog ref={dialogRef}
        className={`pointer-events-auto transition duration-300 shadow rounded bg-background opacity-0 translate-y-full open:opacity-100 open:translate-y-0 p-0 ${fullScreenClasses}`}
    >
        {children}
    </dialog>
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

export function ModalHeader({ text, onClose }: {
    text: string,
    onClose: () => void,
}) {
    return <div className='grid grid-cols-3 text-dimmed min-w-full p-4'>
        <div className='col-start-1 col-end-2' />
        <div className='col-start-2 col-end-3 flex text-center items-center'>
            {text}
        </div>
        <div className='col-start-3 col-end-4 flex justify-end w-full items-center' >
            <div onClick={onClose} className='hover:text-highlight cursor-pointer'>
                <Icon name='close' />
            </div>
        </div>
    </div>
}
