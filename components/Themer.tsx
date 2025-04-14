import { Popover } from '@/components/Popover'
import { IconButton } from '@/components/Buttons'
import { useSetFontScale } from '@/application/theme'

export function ThemerButton() {
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
    const setFontScale = useSetFontScale()
    return <div className="flex flex-row flex-1 items-center justify-around">
        <FontScaleButton scale='down' onClick={() => setFontScale(current => Math.max(10, current - 10))} />
        <FontScaleButton scale='up' onClick={() => setFontScale(current => current + 10)} />
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
