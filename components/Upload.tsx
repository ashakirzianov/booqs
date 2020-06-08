import { useRef, useState } from "react";
import { useAuth, useUpload } from "app";
import { IconButton } from "controls/Buttons";
import { meter } from "controls/theme";
import {
    SelectFileDialogRef, SelectFileDialog,
} from "controls/SelectFileDialog";
import { Spinner } from "controls/Spinner";
import { PopoverSingleton, Popover } from "controls/Popover";
import { Modal, useModal } from "controls/Modal";

export function Upload({ singleton }: {
    singleton: PopoverSingleton,
}) {
    const auth = useAuth();
    const isSigned = auth.state === 'signed';
    const dialogRef = useRef<SelectFileDialogRef>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const {
        content, buttons,
    } = useUploadState({ file });
    const { openModal, modalContent } = useModal({
        render: ({ closeModal }) => ({
            content: <div className='content'>
                {content}
                <style jsx>{`
        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 15rem;
            padding: 0 0 ${meter.regular} 0;
        }
        `}</style>
            </div>,
            buttons: [...buttons, {
                text: 'Dismiss',
                onClick: closeModal,
            }],
        }),
    });

    return <>
        <Popover
            singleton={singleton}
            anchor={<>
                <IconButton
                    icon='upload'
                    onClick={
                        isSigned
                            ? () => dialogRef.current?.show()
                            : undefined
                    }
                />
            </>}
            content={<Label text={
                isSigned
                    ? 'Click to select epub'
                    : 'Sign in to upload'
            } />}
        />
        <SelectFileDialog
            accept='application/epub+zip'
            refCallback={r => dialogRef.current = r}
            onFileChanged={file => {
                setFile(file);
                openModal();
            }}
        />
        {modalContent}
    </>;
}

function useUploadState({ file }: {
    file: File | undefined,
}) {
    const {
        uploaded, uploading, upload,
    } = useUpload();
    if (uploaded) {
        return {
            content: <Label text={`Successfully uploaded: ${uploaded.title}.`} />,
            buttons: [],
        };
    } else if (uploading) {
        return {
            content: <>
                <Label text={`Uploading ${file?.name}...`} />
                <Spinner />
            </>,
            buttons: [],
        };
    } else {
        return {
            content: <Label text={`Upload ${file?.name}`} />,
            buttons: [{
                text: 'Upload',
                onClick: () => upload(file),
            }],
        };
    }
}

function Label({ text }: {
    text: string,
}) {
    return <div>
        {text}
        <style jsx>{`
        div {
            margin: ${meter.large};
            width: 100%;
            text-align: center;
            font-weight: bold;
        }
        `}</style>
    </div>;
}