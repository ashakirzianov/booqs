import { colorSchemeForBaseColor } from '@/application/common'
import { HIGHLIGHT_COLORS, HighlightColor } from '@/application/annotations'

export function ColorPicker({
    selectedColor,
    onColorChange
}: {
    selectedColor: string | undefined,
    onColorChange: (color: HighlightColor) => void,
}) {
    return (
        <div className="flex flex-row h-full items-stretch justify-between">
            {HIGHLIGHT_COLORS.map((color) => (
                <ColorSelectionButton
                    key={color}
                    selected={color === selectedColor}
                    color={`var(--color-highlight-${color})`}
                    callback={() => onColorChange(color)}
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
        onClick={callback} className='flex flex-1 h-full self-stretch text-transparent cursor-pointer transition-all' style={{
            background: backgroundColor,
            borderTop: `0.5rem solid ${borderTopColor}`,
        }}>
    </div>
}
