'use client'
import { PanelButton } from '@/components/Buttons'
import { BooqCover } from '@/components/BooqCover'
import { booqHref } from '@/common/href'
import { useUpload } from '@/application/upload'
import { useCallback, useRef, useState } from 'react'
import { SmallSpinner, UploadIcon } from '@/components/Icons'
import { Modal, ModalButton, ModalDivider, ModalLabel } from '@/components/Modal'

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
                    title={result.title}
                    author={undefined}
                    cover={result.cover}
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
            <SmallSpinner />
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

function useSelectFileDialog({ accept }: {
    accept?: string,
}) {
    const [file, setFile] = useState<File | undefined>(undefined)
    const ref = useRef<HTMLInputElement>(null)
    return {
        openDialog: () => ref.current?.click(),
        dialogContent: <input
            accept={accept}
            style={{ display: 'none' }}
            ref={ref}
            type='file'
            onChange={e => {
                const file = e.target.files && e.target.files[0]
                setFile(file ?? undefined)
            }}
        />,
        file,
        clearFile: () => setFile(undefined),
    }
}