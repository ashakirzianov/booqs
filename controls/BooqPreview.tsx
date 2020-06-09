import { BooqPath } from 'core';
import {
    bookFont, meter, radius, panelShadow, panelShadowHover, vars
} from "./theme";
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
    return <div className='container'>
        <span className='title'>{title}</span>
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
                border: 1px solid var(${vars.border});
                cursor: pointer;
                transition: box-shadow 0.25s;
                padding: ${meter.large} ${meter.xxLarge};
            }
            .container:hover {
                box-shadow: ${panelShadowHover};
            }
            .title {
                color: var(${vars.dimmed});
                text-align: center;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                width: 100%;
            }
            .preview {
                display: -webkit-box;
                -webkit-line-clamp: 6;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: break-space;
                text-indent: ${meter.xxLarge};
                text-align: justify;
                margin: ${meter.large} 0;
            }
            .page {
                display: flex;
                color: var(${vars.dimmed});
                align-self: center;
            }
            `}</style>
    </div>
}