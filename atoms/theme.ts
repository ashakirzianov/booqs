export type Palette = typeof defaultPalette;

export function usePalette(): Palette {
    return defaultPalette;
}

export const panelShadow = '0px 3px 7px rgba(0, 0, 0, 0.1)';
export const brandColor = 'orange';
export const menuFont = 'Lato';
const lightPalette = {
    background: 'white',
    primary: 'black',
    dimmed: '#ddd',
    highlight: brandColor,
};

const defaultPalette = lightPalette;
