export const panelShadow = '0px 0px 5px rgba(0, 0, 0, 0.1)';
export const buttonShadow = '0px 3px 5px rgba(0,0,0,0.1)';
export const brandColor = 'orange';
export const menuFont = 'Lato';
export const bookFont = 'Lora';

export type Color = keyof Palette;
export type Palette = {
    light: string,
    background: string,
    primary: string,
    dimmed: string,
    border: string,
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
        light: 'white',
        background: 'white',
        primary: 'black',
        dimmed: '#888',
        border: '#ddd',
        highlight: brandColor,
    },
    sepia: {
        light: 'white',
        background: '#f9f3e9',
        primary: '#5f3e24',
        dimmed: '#888',
        border: '#ddd',
        highlight: brandColor,
    },
    dark: {
        light: 'black',
        background: 'black',
        primary: '#999',
        dimmed: '#888',
        border: '#333',
        highlight: 'white',
    },
}
