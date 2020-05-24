import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from 'graphql-tag';

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

const SettingsQuery = gql`query SettingsQuery {
    paletteName @client
    fontScale @client
}`;
type SettingsData = {
    paletteName: PaletteName,
    fontScale: number,
};
export const initialSettingsData: SettingsData = {
    paletteName: 'light',
    fontScale: 1,
};

export function usePalette() {
    return useSettings().palette;
}

export function useSettings() {
    const { data } = useQuery<SettingsData>(SettingsQuery);
    const {
        paletteName, fontScale,
    } = data ?? { paletteName: 'light', fontScale: 1 };
    const palette = palettes[paletteName] ?? palettes.light;
    return {
        palette,
        paletteName,
        fontScale,
    };
}
export function useSetSettings() {
    const client = useApolloClient();
    return {
        setPalette(paletteName: PaletteName) {
            client.writeData<Partial<SettingsData>>({
                data: { paletteName },
            });
        },
        setFontScale(fontScale: number) {
            fontScale = Math.max(0.1, fontScale);
            client.writeData<Partial<SettingsData>>({
                data: { fontScale },
            });
        },
    };
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
