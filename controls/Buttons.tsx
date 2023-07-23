import React from 'react'
import { Icon, IconName } from './Icon'
import {
    buttonShadow, meter, radius, boldWeight,
} from './theme'
import { Spinner } from './Spinner'

const buttonSize = 50
export function IconButton({ icon, onClick, isSelected }: {
    icon: IconName,
    onClick?: () => void,
    isSelected?: boolean,
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
                color: var(--theme-dimmed);
                border: none;
                font-size: x-large;
                cursor: pointer;
                transition: color 0.25s;
                background-color: rgba(0, 0, 0, 0);
            }
            .button:hover {
                color: var(--theme-highlight);
            }
            .button:focus {
                outline: 0;
            }
        `}</style>
        <style jsx>{`
            .button {
                color: ${isSelected ? `var(--theme-highlight)` : `var(--theme-dimmed)`}
            }
            `}</style>
    </button>
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
                background-color: var(--theme-action);
                color: var(--theme-background);
                box-shadow: ${buttonShadow};
                font-size: large;
                padding: ${meter.regular};
                cursor: pointer;
                font-weight: 100;
                transition: background-color 0.25s;
            }
            button:hover {
                background-color: var(--theme-highlight);
            }
            `}</style>
    </>
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
            color: var(--theme-action);
            text-decoration: underline;
            font-size: large;
            cursor: pointer;
            transition: color 0.25s;
        }
        .button:hover {
            color: var(--theme-highlight);
        }
        `}</style>
    </>
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
                color: var(--theme-dimmed);
                border: 2px solid var(--theme-dimmed);
                border-radius: ${radius};
                font-weight: ${boldWeight};
                text-decoration: none;
                padding: ${meter.small} ${meter.regular};
                cursor: pointer;
                transition: 250ms border-color, 250ms color;
            }
            .button:hover {
                color: var(--theme-highlight);
                border-color: var(--theme-highlight);
            }
            `}</style>
    </div>
}