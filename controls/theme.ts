// TODO: remove this file

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
