import React from 'react'
import { Icon, IconName } from './Icon'
import { Spinner } from './Spinner'

const buttonSize = 50
export function IconButton({ icon, onClick, isSelected }: {
    icon: IconName,
    onClick?: () => void,
    isSelected?: boolean,
}) {
    const selectedClass = isSelected
        ? 'text-highlight' : 'text-dimmed'
    return <button
        className={`button flex text-dimmed text-2xl cursor-pointer transition bg-transparent hover:text-highlight focus:outline-none ${selectedClass}`}
        onClick={onClick}
    >
        <Icon name={icon} />
    </button>
}

export function ActionButton({ text, onClick }: {
    text: string,
    onClick?: () => void,
}) {
    return <>
        <button onClick={onClick} className='shadow-button rounded p-base'>
            <span>{text}</span>
        </button>
        <style jsx>{`
            button {
                border: none;
                background-color: var(--theme-action);
                color: var(--theme-background);
                font-size: large;
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
    return <div className='button rounded font-bold py-sm px-base' onClick={onClick}>
        {
            !icon ? null :
                <div className='mr-base'><Icon name={icon} /></div>
        }
        {text}
        <style jsx>{`
            .button {
                display: flex;
                text-align: center;
                color: var(--theme-dimmed);
                border: 2px solid var(--theme-dimmed);
                text-decoration: none;
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