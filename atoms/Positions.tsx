import { Preview, BooqPreview } from "./BooqPreview";
import { meter } from "./meter";
import { panelWidth } from "./Panel";

export function Positions({ previews }: {
    previews: Preview[],
}) {
    return <div className='container'>
        {
            previews.map(
                (p, idx) => <div className='preview'>
                    <BooqPreview key={idx} {...p} />
                </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 1;
                flex-direction: row;
                padding: ${meter.xLarge} 50vw;
                overflow: scroll;
                scroll-snap-type: x mandatory;
            }
            .preview {
                display: flex;
                padding: 0 ${meter.large};
                scroll-snap-align: center;
            }
            `}</style>
    </div>
}