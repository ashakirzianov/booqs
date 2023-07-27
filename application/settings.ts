import { useAppState, useAppStateSetter } from './state'

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
export type Settings = {
    paletteName: PaletteName,
    fontScale: number,
};

export function usePalette() {
    return useSettings().palette
}

export function useSettings() {
    const { paletteName, fontScale } = useAppState().settings
    const palette = palettes[paletteName] ?? palettes.light
    return {
        palette,
        paletteName,
        fontScale,
    }
}
export function useSetSettings() {
    const setter = useAppStateSetter()
    return {
        setPalette(paletteName: PaletteName) {
            setter(data => ({
                ...data,
                settings: {
                    ...data.settings,
                    paletteName,
                },
            }))
        },
        setFontScale(fontScale: number) {
            setter(data => ({
                ...data,
                settings: {
                    ...data.settings,
                    fontScale: Math.max(10, fontScale),
                },
            }))
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
