import { BooqPreview, BooqPreviewProps } from "../controls/BooqPreview";
import { meter } from "../controls/meter";

export function ReadingHistory() {
    return <Positions previews={[]} />;
}

function Positions({ previews }: {
    previews: BooqPreviewProps[],
}) {
    if (!previews.length) {
        return null;
    }
    return <div className='container'>
        {
            previews.map(
                (p, idx) => <div key={idx} className='preview'>
                    <BooqPreview {...p} />
                </div>
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex: 1 1;
                flex-direction: row;
                box-sizing: border-box;
                padding: ${meter.xLarge} 25vw;
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