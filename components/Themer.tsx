import { Popover } from '@/components/Popover'
import { IconButton } from '@/components/Buttons'
import { PaletteName, palettes, useSetSettings, useSettings } from '@/application/settings'

export function Themer() {
    return <Popover
        anchor={<IconButton icon='appearance' />}
        content={<ThemerPanel />}
    />
}

function ThemerPanel() {
    return <div className="flex flex-1 flex-col py-xl px-base">
        <FontSettings />
        {/* <hr className='my-xl w-4/5 self-center border-t border-border' />
        <PalettePicker /> */}
    </div>
}

function FontSettings() {
    const { fontScale } = useSettings()
    const { setFontScale } = useSetSettings()
    return <div className="flex flex-row flex-1 items-center justify-around">
        <FontScaleButton scale='down' onClick={() => setFontScale(fontScale - 10)} />
        <FontScaleButton scale='up' onClick={() => setFontScale(fontScale + 10)} />
    </div>
}

function FontScaleButton({ scale, onClick }: {
    scale: 'up' | 'down',
    onClick: () => void,
}) {
    const fontSizeClass = scale === 'up'
        ? 'text-2xl'
        : 'text-lg'
    return <div className='cursor-pointer' onClick={onClick}>
        <span className={`${fontSizeClass} font-book transition text-action hover:text-highlight drop-shadow-md`}>Abc</span>
    </div>
}

function PalettePicker() {
    const { paletteName } = useSettings()
    const { setPalette } = useSetSettings()
    return <div className='flex flex-1 justify-around'>
        <PaletteButton name='light' current={paletteName} onSelect={setPalette} />
        <PaletteButton name='sepia' current={paletteName} onSelect={setPalette} />
        <PaletteButton name='dark' current={paletteName} onSelect={setPalette} />
    </div>
}

const size = '3rem'
function PaletteButton({ name, current, onSelect }: {
    name: PaletteName,
    current: PaletteName,
    onSelect: (name: PaletteName) => void,
}) {
    const checked = current === name
    const { background, highlight, primary } = palettes[name]
    return <div className="flex justify-center items-center text-xl font-book shadow-button overflow-hidden bg-background text-primary cursor-pointer transition-all hover:text-highlight hover:border-highlight" onClick={() => onSelect(name)} style={{
        width: size,
        height: size,
        borderRadius: size,
        border: checked ? `3px solid ${highlight}` : 'none',
        background,
        color: primary,
    }}>
        <div>{name.substring(0, 1).toUpperCase()}</div>
    </div>
}
