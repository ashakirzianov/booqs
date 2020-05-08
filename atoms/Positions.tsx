import { Preview, BooqPreview } from "./BooqPreview";
import { meter } from "./meter";

export function Positions({ previews }: {
    previews: Preview[],
}) {
    return <div className='container'>
        {
            previews.map(
                (p, idx) => <BooqPreview {...p} />
            )
        }
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                justify-content: center;
                overflow: scroll;
                padding: ${meter.xLarge};
            }
            `}</style>
    </div>
}