import { colorSchemeForBaseColor } from '@/application/common'
import { HIGHLIGHT_KINDS } from '@/application/notes'

export function ColorPicker({
    selectedKind,
    onColorChange
}: {
    selectedKind: string,
    onColorChange: (kind: string) => void,
}) {
    return (
        <div className="flex flex-row items-stretch justify-between">
            {HIGHLIGHT_KINDS.map((kind, idx) => (
                <ColorSelectionButton
                    key={idx}
                    selected={kind === selectedKind}
                    color={`var(--color-${kind})`}
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
    const { backgroundColor, selectionColor } = colorSchemeForBaseColor(color)
    const borderTopColor = selected
        ? selectionColor
        : 'rgba(0,0,0,0)'
    return <div
        // Note: prevent loosing selection on safari
        onMouseDown={e => e.preventDefault()}
        onClick={callback} className='flex flex-1 self-stretch text-transparent cursor-pointer h-10 transition-all' style={{
            background: backgroundColor,
            borderTop: `0.5rem solid ${borderTopColor}`,
        }}>
    </div>
}