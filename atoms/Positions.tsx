import { Preview, BooqPreview } from "./BooqPreview";
import { meter } from "./meter";
import { panelWidth } from "./Panel";

export function Positions({ previews }: {
    previews: Preview[],
}) {
    return <div className='container'>
        <div className='content'>
            {
                previews.map(
                    (p, idx) => <div className='preview-container'>
                        <BooqPreview key={idx} {...p} />
                    </div>
                )
            }
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                justify-content: center;
                overflow: scroll;
                padding: ${meter.xLarge};
                scroll-snap-type: x mandatory;
            }
            .content {
                display: flex;
                max-width: 100%;
            }
            .preview-container {
                display: flex;
                padding: 0 ${meter.large};
                scroll-snap-align: start;
            }
            `}</style>
    </div>
}