export const panelShadow = '0px 0px 5px rgba(0, 0, 0, 0.1)';
export const buttonShadow = '0px 3px 5px rgba(0,0,0,0.1)';
export const menuFont = 'Lato';
export const bookFont = 'Lora';

export type Color = keyof Palette;
export type Palette = {
    light: string,
    background: string,
    action: string,
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
        action: '#F57F17',
        primary: 'black',
        dimmed: '#867b6c',
        border: '#ddd',
        highlight: 'orange',
    },
    sepia: {
        light: 'white',
        background: '#f9f3e9',
        action: '#867b6c',
        primary: '#5f3e24',
        dimmed: '#888',
        border: '#ddd',
        highlight: 'orange',
    },
    dark: {
        light: 'black',
        background: 'black',
        action: '#867b6c',
        primary: '#999',
        dimmed: '#888',
        border: '#333',
        highlight: 'white',
    },
}
