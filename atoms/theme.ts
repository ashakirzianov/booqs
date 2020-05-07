export const panelShadow = '0px 3px 7px rgba(0, 0, 0, 0.1)';
export const brandColor = 'orange';
export const menuFont = 'Lato';
export const bookFont = 'Lora';

export type Palette = {
    background: string,
    primary: string,
    dimmed: string,
    highlight: string,
};
export type PaletteKey = 'light' | 'sepia' | 'dark';
export type Palettes = {
    [key in PaletteKey]: Palette;
};

export function usePalette(): Palette {
    return palettes.light;
}

export const palettes: Palettes = {
    light: {
        background: 'white',
        primary: 'black',
        dimmed: '#ddd',
        highlight: brandColor,
    },
    sepia: {
        background: '#f9f3e9',
        primary: '#5f3e24',
        dimmed: '#ddd',
        highlight: brandColor,
    },
    dark: {
        background: 'black',
        primary: '#999',
        dimmed: '#333',
        highlight: 'white',
    },
}
