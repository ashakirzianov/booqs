const meter = 0.5;
function point(p: number) {
    return `${p}rem`;
}

export const regularMeter = point(meter);
export const doubleMeter = point(2 * meter);
export const megaMeter = point(3 * meter);

export const buttonSize = 50;
export const headerHeight = 75;
