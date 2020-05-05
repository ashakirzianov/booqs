export type Palette = typeof defaultPalette;

export function usePalette(): Palette {
    return defaultPalette;
}

const lightPalette = {
    primary: 'black',
    highlight: 'orange',
};

const defaultPalette = lightPalette;
