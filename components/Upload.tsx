import { useAuth, useUpload } from "app";
import { IconButton } from "controls/Buttons";
import { meter } from "controls/theme";
import { useSelectFileDialog } from "controls/SelectFileDialog";
import { Spinner } from "controls/Spinner";
import { PopoverSingleton, Popover } from "controls/Popover";
import { useModal } from "controls/Modal";

export function Upload({ singleton }: {
    singleton: PopoverSingleton,
}) {
    const auth = useAuth();
    const isSigned = auth.state === 'signed';
    const {
        body, buttons,
    } = useModalDefinition();
    const { openModal, modalContent } = useModal(({ closeModal }) => ({
        body: <div className='content'>
            {body}
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
    }));

    return <>
        <Popover
            singleton={singleton}
            anchor={<>
                <IconButton
                    icon='upload'
                    onClick={
                        isSigned
                            ? openModal
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
        {modalContent}
    </>;
}

function useModalDefinition() {
    const {
        file, openDialog, dialogContent,
    } = useSelectFileDialog({ accept: 'application/epub+zip' });
    const {
        uploaded, uploading, upload,
    } = useUpload();
    if (!file) {
        return {
            body: <>
                <Label text='Select file to upload' />
                {dialogContent}
            </>,
            buttons: [{
                text: 'Select .epub',
                onClick: openDialog,
            }],
        };
    } else if (uploaded) {
        return {
            body: <Label text={`Successfully uploaded: ${uploaded.title}.`} />,
            buttons: [],
        };
    } else if (uploading) {
        return {
            body: <>
                <Label text={`Uploading ${file.name}...`} />
                <Spinner />
            </>,
            buttons: [],
        };
    } else {
        return {
            body: <Label text={`${file.name}`} />,
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