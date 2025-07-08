'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CloseIcon } from './Icons'
import clsx from 'clsx'

export function useModalState() {
    const [isOpen, setIsOpen] = useState(false)
    function openModal() {
        setIsOpen(true)
    }
    function closeModal() {
        setIsOpen(false)
    }
    return { isOpen, openModal, closeModal }
}

export function Modal({
    isOpen, children, closeModal
}: {
    isOpen: boolean,
    fullScreen?: boolean,
    closeModal: () => void,
    children: ReactNode,
}) {
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
        className='pointer-events-auto transition duration-300 shadow-xl rounded bg-background
  dark:shadow-slate-800 dark:shadow
  backdrop:backdrop-blur-xs
  opacity-0 open:opacity-100 p-0
  fixed left-1/2 top-0 -translate-x-1/2'
    >
        {children}
    </dialog>
}

export function ModalFullScreen({
    isOpen, children,
}: {
    isOpen: boolean,
    children: ReactNode,
}) {
    return <div
        className={clsx('fixed top-0 right-0 bottom-0 left-0 flex flex-col pointer-events-auto transition duration-300 bg-background h-screen w-screen max-h-screen', {
            'invisible opacity-0 translate-y-1/4': !isOpen,
        })}
    >
        {children}
    </div>
}

export function ModalAsDiv({
    isOpen, children, closeModal
}: {
    isOpen: boolean,
    fullScreen?: boolean,
    closeModal: () => void,
    children: ReactNode,
}) {
    return <div className={clsx('flex flex-col fixed justify-center items-center bg-black/25 z-10 transition-all top-0 right-0 bottom-0 left-0', {
        'invisible bg-transparent': !isOpen,
    })} onClick={closeModal}>
        <div
            className={clsx('relative pointer-events-auto transition duration-300 shadow rounded-sm bg-background', {
                'opacity-0 translate-y-1/4': !isOpen,
            })}
            onClick={e => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
}


export function ModalLabel({ text }: { text: string }) {
    return <div className='p-lg break-words max-w-full text-primary'>{text}</div>
}

export function ModalDivider() {
    return <hr className='w-full border-b-0 border-l-0 border-r-0 border-t-border border-t m-0' />
}

export function ModalButton({ text, icon, href, onClick }: {
    text: string,
    icon?: ReactNode,
    href?: string,
    onClick?: () => void,
}) {
    const content = <div className='flex flex-row items-center'>
        {icon ?? null}
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
    return <div className='grid text-dimmed min-w-full p-lg text-xl text-bold' style={{
        gridTemplateColumns: '1fr auto 1fr',
    }}>
        <div className='col-start-2 col-end-3 flex text-center items-center'>
            {text}
        </div>
        <div className='col-start-3 col-end-4 flex justify-end w-full items-center' >
            <div onClick={onClose} className='hover:text-highlight cursor-pointer'>
                <CloseIcon />
            </div>
        </div>
    </div>
}
