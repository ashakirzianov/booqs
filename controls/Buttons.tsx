import React from 'react';
import { Icon, IconName } from "./Icon";
import {
    buttonShadow, meter, radius, vars,
} from "./theme";
import { Spinner } from './Spinner';

const buttonSize = 50;
export function IconButton({ icon, onClick }: {
    icon: IconName,
    onClick?: () => void,
}) {
    return <button
        className='button'
        onClick={onClick}
    >
        <Icon name={icon} />
        <style jsx>{`
            .button {
                display: flex;
                margin: 0;
                padding: 0;
                height: ${buttonSize};
                color: var(${vars.dimmed});
                border: none;
                font-size: x-large;
                cursor: pointer;
                transition: color 0.25s;
                background-color: rgba(0, 0, 0, 0);
            }
            .button:hover {
                color: var(${vars.highlight});
            }
            .button:focus {
                outline: 0;
            }
        `}</style>
    </button>;
}

export function ActionButton({ text, onClick }: {
    text: string,
    onClick?: () => void,
}) {
    return <>
        <button onClick={onClick}>
            <span>{text}</span>
        </button>
        <style jsx>{`
            button {
                border: none;
                border-radius: ${radius};
                background-color: var(${vars.action});
                color: var(${vars.background});
                box-shadow: ${buttonShadow};
                font-size: large;
                padding: ${meter.regular};
                cursor: pointer;
                font-weight: 100;
                transition: background-color 0.25s;
            }
            button:hover {
                background-color: var(${vars.highlight});
            }
            `}</style>
    </>;
}

export function TextButton({ text, onClick, loading }: {
    text: string,
    onClick?: () => void,
    loading?: boolean,
}) {
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
            color: var(${vars.action});
            text-decoration: none;
            font-size: large;
            cursor: pointer;
            transition: color 0.25s;
        }
        .button:hover {
            color: var(${vars.highlight});
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
                text-align: center;
                color: var(${vars.dimmed});
                border: 2px solid var(${vars.dimmed});
                border-radius: ${radius};
                text-decoration: none;
                padding: ${meter.regular};
                cursor: pointer;
            }
            .button:hover {
                color: var(${vars.highlight});
                border-color: var(${vars.highlight});
            }
            `}</style>
    </div>;
}