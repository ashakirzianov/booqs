export type Palette = typeof defaultPalette;

export function usePalette(): Palette {
    return defaultPalette;
}

export const brandColor = 'orange';
export const menuFont = 'Lato';
const lightPalette = {
    primary: 'black',
    highlight: brandColor,
};

const defaultPalette = lightPalette;
