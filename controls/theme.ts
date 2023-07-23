// TODO: remove this file
export const normalWeight = 300
export const boldWeight = 400
export const extraBoldWeight = 700

export const headerHeight = '3rem'
export const smallScreenWidth = '60rem'
export function isSmallScreen(): boolean {
    if (process.browser) {
        const mql = window.matchMedia(`(max-width: ${smallScreenWidth})`)
        return mql.matches
    } else {
        return false
    }
}

export const meter = {
    small: meterSize(0.5),
    regular: meterSize(1),
    large: meterSize(2),
    xLarge: meterSize(4),
    xxLarge: meterSize(8),
}

function meterSize(x: number) {
    return `${x * 0.5}rem`
}
