'use client'
import { IconButton } from '@/components/Buttons'
import { useSelectFileDialog } from '@/components/SelectFileDialog'
import { Spinner } from '@/components/Loading'
import { Popover } from '@/components/Popover'
import { Modal, ModalButton, ModalDivider, ModalLabel } from '@/components/Modal'
import { BooqCover } from '@/components/BooqCover'
import { booqHref } from '@/components/Links'
import { SignInModal } from './SignInModal'
import { useAuth } from '@/application/auth'
import { useUpload } from '@/application/upload'
import { useCallback, useState } from 'react'

export function UploadButton() {
    const { auth } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    function openModal() {
        setIsOpen(true)
    }
    const closeModal = useCallback(() => {
        setIsOpen(false)
    }, [setIsOpen])
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    function openSignIn() {
        setIsSignInOpen(true)
    }
    const signed = auth.state === 'signed'

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
        <Modal
            isOpen={isOpen}
            closeModal={closeModal}
        >
            <div className='flex flex-col items-center w-60 max-w-[100vw]'>
                <UploadModalContent closeModal={closeModal} />
            </div>
        </Modal>
        <SignInModal
            isOpen={isSignInOpen}
            closeModal={() => setIsSignInOpen(false)}
        />
    </>
}

function UploadModalContent({ closeModal }: {
    closeModal: () => void,
}) {
    const {
        file, openDialog, dialogContent, clearFile,
    } = useSelectFileDialog({ accept: 'application/epub+zip' })
    const {
        uploadFile, loading, result, error,
    } = useUpload()
    function closeAndClear() {
        closeModal()
        clearFile()
    }
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
                onClick={closeAndClear}
            />
        </>
    } else if (result) {
        return <>
            <ModalLabel text={`${result.title}`} />
            <div className='p-4'>
                <BooqCover
                    title={result.title}
                    author={null}
                    cover={result.cover}
                />
            </div>
            <ModalDivider />
            <ModalButton
                text='Read now'
                href={booqHref(result.id, [0])}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeAndClear}
            />
        </>
    } else if (loading) {
        return <>
            <ModalLabel text={`Uploading ${file.name}...`} />
            <Spinner />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeAndClear}
            />
        </>
    } else if (error !== undefined) {
        return <>
            <ModalLabel text={`Error while uploading: ${file.name}`} />
            <ModalLabel text={error} />
            <ModalDivider />
            <ModalButton
                text='Retry'
                onClick={() => uploadFile(file)}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeAndClear}
            />
        </>
    } else {
        return <>
            <ModalLabel text={`${file.name}`} />
            <ModalDivider />
            <ModalButton
                text='Upload'
                onClick={() => uploadFile(file)}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeAndClear}
            />
        </>
    }
}