import { useQuery, useApolloClient } from "@apollo/react-hooks";
import gql from 'graphql-tag';
import { syncStorageCell } from "plat";

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
const storage = syncStorageCell<SettingsData>('settings');
export const initialSettingsData: SettingsData = storage.restore() ?? {
    paletteName: 'light',
    fontScale: 100,
};
storage.store(initialSettingsData);

export function usePalette() {
    return useSettings().palette;
}

export function useSettings() {
    const { data } = useQuery<SettingsData>(SettingsQuery);
    const {
        paletteName, fontScale,
    } = data ?? initialSettingsData;
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
            storage.update({ paletteName });
        },
        setFontScale(fontScale: number) {
            fontScale = Math.max(10, fontScale);
            client.writeData<Partial<SettingsData>>({
                data: { fontScale },
            });
            storage.update({ fontScale });
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
