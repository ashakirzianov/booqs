import React from 'react';
import { Icon, IconName } from "./Icon";
import { meter, buttonSize, radius } from "./meter";
import { usePalette, Color, buttonShadow } from "./theme";

export function IconButton({ icon, onClick }: {
    icon: IconName,
    onClick?: () => void,
}) {
    const { primary, highlight } = usePalette();
    return <button
        onClick={onClick}
    >
        <Icon name={icon} />
        <style jsx>{`
            button {
                display: flex;
                height: ${buttonSize};
                margin: ${meter.regular};
                color: ${primary};
                border: none;
                font-size: x-large;
                cursor: pointer;
            }
            button:hover {
                color: ${highlight};
            }
        `}</style>
    </button>;
}

export function ActionButton({ text, onClick }: {
    text: string,
    onClick?: () => void,
}) {
    const { highlight, light } = usePalette();
    return <>
        <button>
            <span>{text}</span>
        </button>
        <style jsx>{`
            button {
                border: none;
                border-radius: ${radius};
                background-color: ${highlight};
                color: ${light};
                box-shadow: ${buttonShadow};
                font-size: large;
                padding: ${meter.regular};
                cursor: pointer;
                font-weight: 100;
            }
            `}</style>
    </>;
}