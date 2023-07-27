'use client'
import { IconButton } from '@/components/Buttons'
import { useSelectFileDialog } from '@/components/SelectFileDialog'
import { Spinner } from '@/components/Spinner'
import { Popover } from '@/components/Popover'
import { useModal } from '@/components/Modal'
import { BooqCover } from '@/components/BooqCover'
import { booqHref } from '@/components/Links'
import { useSignInModal } from './SignIn'
import { useAuth } from '@/application/auth'
import { useUpload } from '@/application/upload'

export function Upload() {
    const { signed } = useAuth() ?? {}
    const {
        body, buttons, clearFile,
    } = useModalDefinition()
    const { openModal, ModalContent } = useModal(({ closeModal }) => ({
        body: <div className='flex flex-col items-center w-60 max-w-[100vw] p-lg'>
            {body}
        </div>,
        buttons: [...buttons, {
            text: 'Dismiss',
            onClick() {
                closeModal()
                clearFile()
            }
        }],
    }))
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
            content={<Label text={
                signed
                    ? 'Click to select epub'
                    : 'Sign in to upload'
            } />}
            hasAction={true}
        />
        {ModalContent}
        {SignInModalContent}
    </>
}

function useModalDefinition() {
    const {
        file, openDialog, dialogContent, clearFile,
    } = useSelectFileDialog({ accept: 'application/epub+zip' })
    const {
        uploaded, uploading, upload,
    } = useUpload()
    if (!file) {
        return {
            clearFile,
            body: <>
                <Label text='Select file to upload' />
                {dialogContent}
            </>,
            buttons: [{
                text: 'Select .epub',
                onClick: openDialog,
            }],
        }
    } else if (uploaded) {
        return {
            clearFile,
            body: <>
                <Label text={`${uploaded.title}`} />
                <BooqCover
                    title={uploaded.title}
                    cover={uploaded.cover}
                />
            </>,
            buttons: [{
                text: 'Read now',
                href: booqHref(uploaded.id, [0]),
            }],
        }
    } else if (uploading) {
        return {
            clearFile,
            body: <>
                <Label text={`Uploading ${file.name}...`} />
                <Spinner />
            </>,
            buttons: [],
        }
    } else {
        return {
            clearFile,
            body: <Label text={`${file.name}`} />,
            buttons: [{
                text: 'Upload',
                onClick: () => upload(file),
            }],
        }
    }
}

function Label({ text }: {
    text: string,
}) {
    return <div className='m-lg w-full text-center font-bold'>
        {text}
    </div>
}