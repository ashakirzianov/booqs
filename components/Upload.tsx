'use client'
import { PanelButton } from '@/components/Buttons'
import { useSelectFileDialog } from '@/components/SelectFileDialog'
import { Modal, ModalButton, ModalDivider, ModalLabel } from '@/components/Modal'
import { BooqCover } from '@/components/BooqCover'
import { booqHref } from '@/common/href'
import { useUpload } from '@/application/upload'
import { useCallback, useState } from 'react'
import { Spinner, UploadIcon } from '@/components/Icons'

export function UploadButton() {
    const [isOpen, setIsOpen] = useState(false)
    function openModal() {
        setIsOpen(true)
    }
    const closeModal = useCallback(() => {
        setIsOpen(false)
    }, [setIsOpen])

    return <>
        <PanelButton onClick={openModal}>
            <UploadIcon />
        </PanelButton>
        <Modal
            isOpen={isOpen}
            closeModal={closeModal}
        >
            <div className='flex flex-col items-center w-60 max-w-[100vw]'>
                <UploadModalContent closeModal={closeModal} />
            </div>
        </Modal>
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
                    booqId={result.booqId}
                    title={result.title}
                    author={undefined}
                    coverSrc={result.coverSrc}
                />
            </div>
            <ModalDivider />
            <ModalButton
                text='Read now'
                href={booqHref({ booqId: result.booqId, path: [0] })}
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