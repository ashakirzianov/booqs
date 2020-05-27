import React from 'react';
import { usePalette } from '../app';
import { Icon, IconName } from "./Icon";
import {
    buttonShadow, meter, radius,
} from "./theme";
import { Spinner } from './Spinner';

const buttonSize = 50;
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
            button:focus {
                outline: 0;
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

export function TextButton({ text, onClick, loading }: {
    text: string,
    onClick?: () => void,
    loading?: boolean,
}) {
    const { action, highlight } = usePalette();
    return <>
        <span className='button' onClick={onClick}>
            {text}
            {
                loading
                    ? <Spinner />
                    : null
            }
        </span>
        <style jsx>{`
        .button {
            color: ${action};
            text-decoration: none;
            font-size: large;
            cursor: pointer;
            transition: color 0.25s;
        }
        .button:hover {
            color: ${highlight};
            text-decoration: underline;
        }
        `}</style>
    </>;
}

export function BorderButton({ text, icon, onClick }: {
    text: string,
    icon?: IconName,
    onClick?: () => void,
}) {
    const { dimmed, highlight } = usePalette();
    return <div className='button' onClick={onClick}>
        {
            !icon ? null :
                <div className='icon'><Icon name={icon} /></div>
        }
        {text}
        <style jsx>{`
            .icon {
                margin: 0 ${meter.regular} 0 0;
            }
            .button {
                display: flex;
                color: ${dimmed};
                border: 2px solid ${dimmed};
                border-radius: ${radius};
                text-decoration: none;
                padding: ${meter.regular};
                cursor: pointer;
            }
            .button:hover {
                color: ${highlight};
                border-color: ${highlight};
            }
            `}</style>
    </div>;
}