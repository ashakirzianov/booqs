import { useAuth, useUpload } from "app";
import { IconButton } from "controls/Buttons";
import { meter } from "controls/theme";
import { useSelectFileDialog } from "controls/SelectFileDialog";
import { Spinner } from "controls/Spinner";
import { PopoverSingleton, Popover } from "controls/Popover";
import { useModal } from "controls/Modal";
import { BooqCover } from "controls/BooqCover";
import { booqHref } from "controls/Links";

export function Upload({ singleton }: {
    singleton?: PopoverSingleton,
}) {
    const { signed } = useAuth();
    const {
        body, buttons, clearFile,
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
                    max-width: 100vw;
                    padding: ${meter.large};
                }
                `}</style>
        </div>,
        buttons: [...buttons, {
            text: 'Dismiss',
            onClick() {
                closeModal();
                clearFile();
            }
        }],
    }));

    return <>
        <Popover
            singleton={singleton}
            anchor={<>
                <IconButton
                    icon='upload'
                    onClick={
                        signed
                            ? openModal
                            : undefined
                    }
                />
            </>}
            content={<Label text={
                signed
                    ? 'Click to select epub'
                    : 'Sign in to upload'
            } />}
        />
        {modalContent}
    </>;
}

function useModalDefinition() {
    const {
        file, openDialog, dialogContent, clearFile,
    } = useSelectFileDialog({ accept: 'application/epub+zip' });
    const {
        uploaded, uploading, upload,
    } = useUpload();
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
        };
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
        };
    } else if (uploading) {
        return {
            clearFile,
            body: <>
                <Label text={`Uploading ${file.name}...`} />
                <Spinner />
            </>,
            buttons: [],
        };
    } else {
        return {
            clearFile,
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