'use client'
import { IconButton } from '@/components/Buttons'
import { useSelectFileDialog } from '@/components/SelectFileDialog'
import { Spinner } from '@/components/Loading'
import { Popover } from '@/components/Popover'
import { ModalButton, ModalDivider, ModalLabel, useModal } from '@/components/Modal'
import { BooqCover } from '@/components/BooqCover'
import { booqHref } from '@/components/Links'
import { useSignInModal } from './SignIn'
import { useAuth } from '@/application/auth'
import { useUpload } from '@/application/upload'
import { useState } from 'react'

export function Upload() {
    const { signed } = useAuth() ?? {}
    const [isOpen, setIsOpen] = useState(false)
    function openModal() {
        setIsOpen(true)
    }
    function closeModal() {
        setIsOpen(false)
    }
    const { ModalContent } = useModal({
        isOpen,
        setIsOpen,
        content: <div className='flex flex-col items-center w-60 max-w-[100vw]'>
            <UploadModalContent closeModal={closeModal} />
        </div>,
    })
    const {
        openModal: openSignIn,
        ModalContent: SignInModalContent,
    } = useSignInModal()

    return <>
        <Popover
            anchor={<>
                <IconButton
                    icon='upload'
                    onClick={
                        signed
                            ? openModal
                            : openSignIn
                    }
                />
            </>}
            content={<div className='m-lg w-full text-center font-bold'>
                {signed
                    ? 'Click to select epub'
                    : 'Sign in to upload'}
            </div>}
            hasAction={true}
        />
        {ModalContent}
        {SignInModalContent}
    </>
}

function UploadModalContent({ closeModal }: {
    closeModal: () => void,
}) {
    const {
        file, openDialog, dialogContent, clearFile,
    } = useSelectFileDialog({ accept: 'application/epub+zip' })
    const {
        uploaded, uploading, upload,
    } = useUpload()
    if (!file) {
        return <>
            <ModalLabel text='Select file to upload' />
            {dialogContent}
            <ModalDivider />
            <ModalButton
                text='Select .epub'
                onClick={openDialog}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </>
    } else if (uploaded) {
        return <>
            <ModalLabel text={`${uploaded.title}`} />
            <BooqCover
                title={uploaded.title}
                cover={uploaded.cover}
            />
            <ModalDivider />
            <ModalButton
                text='Read now'
                href={booqHref(uploaded.id, [0])}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </>
    } else if (uploading) {
        return <>
            <ModalLabel text={`Uploading ${file.name}...`} />
            <Spinner />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </>
    } else {
        return <>
            <ModalLabel text={`${file.name}`} />
            <ModalDivider />
            <ModalButton
                text='Upload'
                onClick={() => upload(file)}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </>
    }
}