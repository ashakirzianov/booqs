import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import { syncStorageCell } from 'plat'

type Palette = {
    background: string,
    action: string,
    primary: string,
    dimmed: string,
    border: string,
    highlight: string,
};
type Palettes = {
    [key in PaletteName]: Palette;
};
type SettingsData = {
    paletteName: PaletteName,
    fontScale: number,
};
const key = 'settings'
const storage = syncStorageCell<SettingsData>(key)
const initialSettingsData: SettingsData = storage.restore() ?? {
    paletteName: 'light',
    fontScale: 100,
}
storage.store(initialSettingsData)
const settingsState = atom({
    key,
    default: initialSettingsData,
})

export function usePalette() {
    return useSettings().palette
}

export function useSettings() {
    const { paletteName, fontScale } = useRecoilValue(settingsState)
    const palette = palettes[paletteName] ?? palettes.light
    return {
        palette,
        paletteName,
        fontScale,
    }
}
export function useSetSettings() {
    const setter = useSetRecoilState(settingsState)
    return {
        setPalette(paletteName: PaletteName) {
            setter(curr => {
                const next = {
                    ...curr,
                    paletteName,
                }
                storage.store(next)
                return next
            })
        },
        setFontScale(fontScale: number) {
            setter(curr => {
                fontScale = Math.max(10, fontScale)
                const next = {
                    ...curr,
                    fontScale,
                }
                storage.store(next)
                return next
            })
        },
    }
}

export type PaletteName = 'light' | 'sepia' | 'dark';
export const palettes: Palettes = {
    light: {
        background: 'white',
        action: '#F57F17',
        primary: 'black',
        dimmed: '#867b6c',
        border: '#ddd',
        highlight: 'orange',
    },
    sepia: {
        background: '#f9f3e9',
        action: '#867b6c',
        primary: '#5f3e24',
        dimmed: '#888',
        border: '#ddd',
        highlight: 'orange',
    },
    dark: {
        background: 'black',
        action: '#867b6c',
        primary: '#999',
        dimmed: '#888',
        border: '#333',
        highlight: 'white',
    },
}
