import { useCallback, useContext } from 'react'
import { makeStateProvider, StateSetter } from './state'

export type ThemeState = {
    fontScale: number,
}
const {
    StateProvider: ThemeProvider,
    Context,
} = makeStateProvider<ThemeState>({
    key: 'theme',
    initialData: {
        fontScale: 120,
    },
})

export { ThemeProvider }
export function useFontScale() {
    const { data } = useContext(Context)
    return data.fontScale
}
export function useSetFontScale(): StateSetter<number> {
    const { data, setData } = useContext(Context)
    return useCallback<StateSetter<number>>(valueOrFunc => {
        if (typeof valueOrFunc === 'function') {
            setData(theme => ({
                ...theme,
                fontScale: valueOrFunc(theme.fontScale),
            }))
        } else {
            setData({
                ...data,
                fontScale: valueOrFunc,
            })
        }
    }, [data, setData])
}
