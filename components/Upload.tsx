import { ActionButton } from "../controls/Buttons";
import { meter } from "../controls/theme";

export function UploadPanel() {
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
    </div>
}