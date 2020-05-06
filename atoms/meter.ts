function meterSize(x: number) {
    return `${x * 0.5}rem`;
}

export const meter = {
    small: meterSize(0.5),
    regular: meterSize(1),
    large: meterSize(2),
    xLarge: meterSize(4),
    xxLarge: meterSize(8),
}

export const buttonSize = 50;
export const headerHeight = 75;
