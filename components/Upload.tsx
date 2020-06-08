import { useRef, useState } from "react";
import { useAuth, useUpload } from "app";
import { IconButton } from "controls/Buttons";
import { meter } from "controls/theme";
import {
    SelectFileDialogRef, SelectFileDialog,
} from "controls/SelectFileDialog";
import { Spinner } from "controls/Spinner";
import { PopoverSingleton, Popover } from "controls/Popover";
import { Modal } from "controls/Modal";

export function Upload({ singleton }: {
    singleton: PopoverSingleton,
}) {
    const auth = useAuth();
    const isSigned = auth.state === 'signed';
    const dialogRef = useRef<SelectFileDialogRef>();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [open, setOpen] = useState(false);

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
                setOpen(true);
            }}
        />
        <UploadModal
            file={file}
            isOpen={open}
            close={() => setOpen(false)}
        />
    </>;
}

function UploadModal({ file, isOpen, close }: {
    file?: File,
    isOpen: boolean,
    close: () => void,
}) {
    const { content, buttons } = useUploadState({ file, close });
    return <Modal
        isOpen={isOpen}
        close={close}
        buttons={buttons}
    >
        <div className='content'>
            {content}
        </div>
        <style jsx>{`
            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 15rem;
                padding: 0 0 ${meter.regular} 0;
            }
            `}</style>
    </Modal>;
}

function useUploadState({ close, file }: {
    close: () => void,
    file: File | undefined,
}) {
    const {
        uploaded, uploading, upload,
    } = useUpload();
    const dismissProps = {
        text: 'Dismiss',
        onClick: close,
    };
    if (uploaded) {
        return {
            content: <Label text={`Successfully uploaded: ${uploaded.title}.`} />,
            buttons: [dismissProps],
        };
    } else if (uploading) {
        return {
            content: <>
                <Label text={`Uploading ${file?.name}...`} />
                <Spinner />
            </>,
            buttons: [dismissProps],
        };
    } else {
        return {
            content: <Label text={`Upload ${file?.name}`} />,
            buttons: [
                {
                    text: 'Upload',
                    onClick: () => upload(file),
                },
                dismissProps,
            ],
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