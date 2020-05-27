import { BooqPreview } from "../controls/BooqPreview";
import { meter } from "../controls/theme";
import { useHistory, pageForPosition } from "app";

export function ReadingHistory() {
    const { history } = useHistory();
    if (!history.length) {
        return null;
    }
    return <div className='container'>
        {
            history.map(
                (entry, idx) =>
                    <div key={idx} className='preview'>
                        <BooqPreview
                            path={entry.path}
                            text={entry.preview}
                            title={entry.title ?? ''}
                            page={pageForPosition(entry.position)}
                            total={pageForPosition(entry.length)}
                        />
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