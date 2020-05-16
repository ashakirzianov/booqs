import React from 'react';
import { usePalette } from '../app';
import { Icon, IconName } from "./Icon";
import {
    buttonShadow, meter, buttonSize, radius,
} from "./theme";

export function IconButton({ icon, callback }: {
    icon: IconName,
    callback?: () => void,
}) {
    const { dimmed, highlight } = usePalette();
    return <button
        onClick={callback}
    >
        <Icon name={icon} />
        <style jsx>{`
            button {
                display: flex;
                height: ${buttonSize};
                color: ${dimmed};
                border: none;
                font-size: x-large;
                cursor: pointer;
                transition: color 0.25s;
                background-color: rgba(0, 0, 0, 0);
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
    const { action, background, highlight } = usePalette();
    return <>
        <button onClick={onClick}>
            <span>{text}</span>
        </button>
        <style jsx>{`
            button {
                border: none;
                border-radius: ${radius};
                background-color: ${action};
                color: ${background};
                box-shadow: ${buttonShadow};
                font-size: large;
                padding: ${meter.regular};
                cursor: pointer;
                font-weight: 100;
                transition: background-color 0.25s;
            }
            button:hover {
                background-color: ${highlight};
            }
            `}</style>
    </>;
}

export function LinkButton({ text }: {
    text: string,
}) {
    const { action, highlight } = usePalette();
    return <>
        <a>{text}</a>
        <style jsx>{`
        a {
            color: ${action};
            text-decoration: none;
            font-size: large;
            cursor: pointer;
            transition: color 0.25s;
        }
        a:hover {
            color: ${highlight};
            text-decoration: underline;
        }
        `}</style>
    </>;
}