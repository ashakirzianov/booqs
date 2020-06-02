import { useRef, useState } from "react";
import { useAuth, useUpload } from "app";
import { ActionButton, IconButton } from "controls/Buttons";
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
            onFileChanged={setFile}
        />
        <Modal
            isOpen={!!file}
            close={() => setFile(undefined)}
        >
            <div className='modal'>
                <UploadModalContent file={file!} />
            </div>
            <style jsx>{`
                .modal {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 30rem;
                    padding: 0 0 ${meter.regular} 0;
                }
                `}</style>
        </Modal>
    </>;
}

function UploadModalContent({ file }: {
    file: File,
}) {
    const {
        uploaded, uploading, upload,
    } = useUpload();
    if (uploaded) {
        return <Label text={`Successfully uploaded: ${uploaded.title}.`} />;
    } else if (uploading) {
        return <>
            <Label text={`Uploading ${file.name}...`} />
            <Spinner />
        </>;
    } else {
        return <>
            <Label text={`Upload ${file.name}`} />
            <ActionButton
                text='Upload'
                onClick={() => upload(file)}
            />
        </>;
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