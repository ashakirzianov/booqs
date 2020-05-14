import {
    bookFont, buttonShadow, meter,
} from "../controls/theme";

import { usePalette, PaletteName, palettes, useSetPalette } from '../app';

export function ThemerPanel() {
    const { border } = usePalette();
    return <div className="container">
        <FontSettings />
        <hr />
        <PalettePicker />
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-direction: column;
                padding: ${meter.xLarge} ${meter.regular};
            }
            hr {
                width: 80%;
                margin: ${meter.xLarge} 0;
                align-self: center;
                border: none;
                border-top: 1px solid ${border};
            }
        `}</style>
    </div>;
}

function FontSettings() {
    return <div className="container">
        <FontScaleButton scale='down' />
        <FontScaleButton scale='up' />
        <style jsx>{`
            .container {
                display: flex;
                flex-direction: row;
                flex: 1;
                align-items: center;
                justify-content: space-around;
            }
            `}</style>
    </div>
}

function FontScaleButton({ scale }: {
    scale: 'up' | 'down',
}) {
    const { highlight } = usePalette();
    const fontSize = scale === 'up'
        ? 'xx-large'
        : 'large';
    return <div>
        <span>Abc</span>
        <style jsx>{`
            div {
                cursor: pointer;
            }
            span {
                font-size: ${fontSize};
                font-family: ${bookFont};
                transition: color 0.25s;
            }
            span:hover {
                color: ${highlight};
            }
            `}</style>
    </div>
}

function PalettePicker() {
    const setPalette = useSetPalette();
    return <div>
        <PaletteButton name='light' checked={true} onSelect={setPalette} />
        <PaletteButton name='sepia' checked={false} onSelect={setPalette} />
        <PaletteButton name='dark' checked={false} onSelect={setPalette} />
        <style jsx>{`
            div {
                display: flex;
                flex-direction: row;
                flex: 1;
                justify-content: space-around;
            }
            `}</style>
    </div>;
}

const size = '3rem';
function PaletteButton({ name, checked, onSelect }: {
    name: PaletteName,
    checked: boolean,
    onSelect: (name: PaletteName) => void,
}) {
    const { background, highlight, primary } = palettes[name];
    return <div className="container" onClick={() => onSelect(name)}>
        <div className="label">{name.substr(0, 1).toUpperCase()}</div>
        <style jsx>{`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: x-large;
                font-family: ${bookFont};
                padding: 0;
                width: ${size};
                height: ${size};
                border-radius: ${size};
                border: ${checked ? `3px solid ${highlight}` : 'none'};
                overflow: hidden;
                background-color: ${background};
                color: ${primary};
                box-shadow: ${buttonShadow};
                cursor: pointer;
                transition: color 0.25s, border 0.25s;
            }
            .container:hover {
                color: ${highlight};
                border: 3px solid ${highlight};
            }
            `}</style>
    </div>
}
