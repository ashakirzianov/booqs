import { useAppState, useAppStateSetter } from './state'

export type Settings = {
    fontScale: number,
};
export function useFontScale() {
    let { fontScale } = useAppState().settings
    return fontScale
}
export function useSetFontScale() {
    const setter = useAppStateSetter()
    return function setFontScale(fontScale: number) {
        setter(data => ({
            ...data,
            settings: {
                ...data.settings,
                fontScale: Math.max(10, fontScale),
            },
        }))
    }
}
