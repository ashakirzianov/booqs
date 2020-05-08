import React from 'react';
import { Icon, IconName } from "./Icon";
import { meter, buttonSize, radius } from "./meter";
import { usePalette, buttonShadow } from "./theme";

export function IconButton({ icon, onClick }: {
    icon: IconName,
    onClick?: () => void,
}) {
    const { dimmed, highlight } = usePalette();
    return <button
        onClick={onClick}
    >
        <Icon name={icon} />
        <style jsx>{`
            button {
                display: flex;
                height: ${buttonSize};
                margin: ${meter.regular};
                color: ${dimmed};
                border: none;
                font-size: x-large;
                cursor: pointer;
                transition: color 0.25s;
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
    const { action, light, highlight } = usePalette();
    return <>
        <button>
            <span>{text}</span>
        </button>
        <style jsx>{`
            button {
                border: none;
                border-radius: ${radius};
                background-color: ${action};
                color: ${light};
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