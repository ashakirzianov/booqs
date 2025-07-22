import { resolveNoteColor, noteColoredKinds } from '@/application/common'

export function ColorPicker({
    selectedKind,
    onColorChange
}: {
    selectedKind: string,
    onColorChange: (kind: string) => void,
}) {
    return (
        <div className="flex flex-row items-stretch justify-between">
            {noteColoredKinds.map((kind, idx) => (
                <ColorSelectionButton
                    key={idx}
                    selected={kind === selectedKind}
                    color={resolveNoteColor(kind)}
                    callback={() => onColorChange(kind)}
                />
            ))}
        </div>
    )
}

function ColorSelectionButton({ color, selected, callback }: {
    selected: boolean,
    color: string,
    callback: () => void,
}) {
    return <div
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback} className='flex flex-1 self-stretch text-transparent cursor-pointer h-10 transition-all' style={{
            background: color,
            borderBottom: `0.5rem solid ${selected ? `${color}` : `rgba(0,0,0,0)`}`,
        }}>
    </div>
}