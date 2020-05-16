import { ActionButton } from "../controls/Buttons";
import { meter } from "../controls/theme";
import { useAuth } from "../app";
import { SignInMenu } from "./SignIn";
import { useRef } from "react";
import { SelectFileDialogRef, SelectFileDialog } from "../controls/SelectFileDialog";

export function UploadPanel() {
    const state = useAuth();
    if (state.state !== 'signed') {
        return <SingInToUpload />;
    } else {
        return <UploadFile />;
    }
}

function UploadFile() {
    const dialogRef = useRef<SelectFileDialogRef>();

    return <div className='container'>
        <SelectFileDialog
            accept='application/epub+zip'
            refCallback={r => dialogRef.current = r}
            onFilesSelected={() => undefined}
        />
        <span>Select .epub file</span>
        <ActionButton
            text='Select'
            onClick={() => {
                if (dialogRef.current) {
                    dialogRef.current.show();
                }
            }}
        />
        <style jsx>{`
        span {
            margin: ${meter.regular};
            font-size: large;
        }
        .container {
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;
            padding: ${meter.xLarge} ${meter.large};
        }
        `}</style>
    </div>;
}

function SingInToUpload() {
    return <div>
        <span>Sing in to upload</span>
        <SignInMenu />
        <style jsx>{`
        div {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: ${meter.regular} 0;
            align-items: stretch;
        }
        span {
            width: 100%;
            text-align: center;
            font-weight: bold;
            padding: ${meter.regular};
        }
        `}</style>
    </div>;
}