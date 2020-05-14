import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

type Color = keyof Palette;
type Palette = {
    light: string,
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

const PaletteQuery = gql`query PaletteQuery {
    palette @client
}`;
type PaletteData = {
    palette: PaletteName,
};
export const initialPaletteData: PaletteData = {
    palette: 'light',
};
export function usePalette(): Palette & { name: PaletteName } {
    const { data } = useQuery<PaletteData>(PaletteQuery);
    const name = data?.palette ?? 'light';
    return {
        ...palettes[name],
        name,
    };
}
export function useSetPalette() {
    const client = useApolloClient();
    return function (palette: PaletteName) {
        client.writeData<PaletteData>({
            data: { palette },
        });
    };
}

export type PaletteName = 'light' | 'sepia' | 'dark';
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
