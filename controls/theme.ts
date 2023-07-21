export const panelShadow = '0px 0px 5px rgba(0, 0, 0, 0.1)'
export const panelShadowHover = '0px 5px 15px rgba(0,0,0,0.1)'
export const buttonShadow = '0px 3px 5px rgba(0,0,0,0.1)'
export const menuFontPrimary = 'Lato' // 'Lato' // 'Spartan'
export const menuFont = `${menuFontPrimary}, Sans-Serif`
export const bookFont = 'Lora'
export const normalWeight = 300
export const boldWeight = 400
export const extraBoldWeight = 700

export const fontHref = `https://fonts.googleapis.com/css2?${fontDef(menuFontPrimary, normalWeight, boldWeight, extraBoldWeight)}&${fontDef(bookFont)}`

function fontDef(name: string, ...weights: number[]) {
    const family = name.split(' ').join('+')
    const wght = weights.length
        ? `:wght@${weights.join(';')}`
        : ''
    return `family=${family}${wght}&display=swap`
}

export const radius = '4px'

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

export const vars = {
    background: '--theme-background',
    action: '--theme-action',
    primary: '--theme-primary',
    dimmed: '--theme-dimmed',
    border: '--theme-border',
    highlight: '--theme-highlight',
}
