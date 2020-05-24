export const panelShadow = '0px 0px 5px rgba(0, 0, 0, 0.1)';
export const panelShadowHover = '0px 5px 15px rgba(0,0,0,0.1)';
export const buttonShadow = '0px 3px 5px rgba(0,0,0,0.1)';
export const menuFontPrimary = 'Lato';
export const logoFont = 'Lato';
export const menuFont = `${menuFontPrimary}, Sans-Serif`;
export const bookFont = 'Lora';
export const normalWeight = 200;
export const boldWeight = 400;
export const extraBoldWeight = 700;

export const radius = '4px';

export const headerHeight = '4rem';

export const meter = {
    small: meterSize(0.5),
    regular: meterSize(1),
    large: meterSize(2),
    xLarge: meterSize(4),
    xxLarge: meterSize(8),
}

function meterSize(x: number) {
    return `${x * 0.5}rem`;
}
