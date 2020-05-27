import { usePalette } from '../app';
import { bookFont, meter, radius, panelShadow, panelShadowHover } from "./theme";
import { panelWidth } from "./Panel";
import { PropsType } from "./utils";

export type BooqPreviewProps = PropsType<typeof BooqPreview>;
export function BooqPreview({
    text, title, page,
}: {
    path: BooqPath,
    text: string,
    title: string,
    page: number,
    total: number,
}) {
    const { dimmed, border } = usePalette();
    return <div className='container'>
        <div className='title'>{title}</div>
        <div className='preview'>{text}</div>
        <div className='page'>{page}</div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 0 auto;
                width: 75vw;
                max-width: ${panelWidth};
                flex-direction: column;
                align-items: center;
                box-shadow: ${panelShadow};
                font-family: ${bookFont};
                font-size: large;
                border-radius: ${radius};
                border: 1px solid ${border};
                cursor: pointer;
                transition: box-shadow 0.25s;
            }
            .container:hover {
                box-shadow: ${panelShadowHover};
            }
            .title {
                display: flex;
                color: ${dimmed};
                margin: ${meter.large} 0 0 0;
            }
            .preview {
                display: -webkit-box;
                -webkit-line-clamp: 8;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: break-space;
                text-indent: ${meter.xxLarge};
                text-align: justify;
                margin: ${meter.large} 0 0 0;
                padding: 0 ${meter.xxLarge};
            }
            .page {
                display: flex;
                color: ${dimmed};
                align-self: center;
                margin: ${meter.large} ${meter.xLarge};
            }
            `}</style>
    </div>
}