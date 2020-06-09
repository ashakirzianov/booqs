import {
    PaletteName, palettes, useSetSettings, useSettings,
} from 'app';
import {
    bookFont, buttonShadow, meter, vars,
} from "controls/theme";
import { PopoverSingleton, Popover } from "controls/Popover";
import { IconButton } from "controls/Buttons";

export function Themer({ singleton }: {
    singleton: PopoverSingleton,
}) {
    return <Popover
        singleton={singleton}
        anchor={<IconButton icon='appearance' />}
        content={<ThemerPanel />}
    />;
}

function ThemerPanel() {
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
                border-top: 1px solid var(${vars.border});
            }
        `}</style>
    </div>;
}

function FontSettings() {
    const { fontScale } = useSettings();
    const { setFontScale } = useSetSettings();
    return <div className="container">
        <FontScaleButton scale='down' onClick={() => setFontScale(fontScale - 10)} />
        <FontScaleButton scale='up' onClick={() => setFontScale(fontScale + 10)} />
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

function FontScaleButton({ scale, onClick }: {
    scale: 'up' | 'down',
    onClick: () => void,
}) {
    const fontSize = scale === 'up'
        ? 'xx-large'
        : 'large';
    return <div onClick={onClick}>
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
                color: var(${vars.highlight});
            }
            `}</style>
    </div>
}

function PalettePicker() {
    const { paletteName } = useSettings();
    const { setPalette } = useSetSettings();
    return <div>
        <PaletteButton name='light' current={paletteName} onSelect={setPalette} />
        <PaletteButton name='sepia' current={paletteName} onSelect={setPalette} />
        <PaletteButton name='dark' current={paletteName} onSelect={setPalette} />
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
function PaletteButton({ name, current, onSelect }: {
    name: PaletteName,
    current: PaletteName,
    onSelect: (name: PaletteName) => void,
}) {
    const checked = current === name;
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
