import { ActionButton } from "../controls/Buttons";
import { meter } from "../controls/theme";
import { useAuth } from "../app";
import { SignInMenu } from "./SignIn";

export function UploadPanel() {
    const state = useAuth();
    if (state.state !== 'signed') {
        return <SingInToUpload />;
    } else {
        return <UploadFile />;
    }
}

function UploadFile() {
    return <div className='container'>
        <span>Upload .epub file</span>
        <ActionButton text='Upload' />
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