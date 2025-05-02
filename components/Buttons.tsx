import React from 'react'
import { Icon, IconName } from './Icon'
import { Spinner } from './Loading'

export function ActionButtonWrapper({ children }: {
    children: React.ReactNode,
}) {
    return <div className='text-dimmed hover:text-highlight'>
        {children}
    </div>
}

export function IconButton({ icon, onClick, isSelected }: {
    icon: IconName,
    onClick?: () => void,
    isSelected?: boolean,
}) {
    const selectedClass = isSelected
        ? 'text-highlight' : 'text-dimmed'
    return <button
        className={`button flex text-dimmed text-2xl cursor-pointer transition bg-transparent hover:text-highlight focus:outline-hidden ${selectedClass} w-8 h-8 justify-center items-center`}
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
        <button onClick={onClick} className='shadow-button rounded-sm p-base border-none bg-action text-lg cursor-pointer font-light transition duration-300 hover:bg-highlight'>
            <span>{text}</span>
        </button>
    </>
}

export function TextButton({ text, onClick, loading }: {
    text: string,
    onClick?: () => void,
    loading?: boolean,
}) {
    return <>
        <span className='text-action underline text-lg cursor-pointer transition duration-300 hover:text-highlight' onClick={onClick}>
            {text}
            {
                loading
                    ? <Spinner />
                    : null
            }
        </span>
    </>
}

export function BorderButton({ text, icon, onClick }: {
    text: string,
    icon?: IconName,
    onClick?: () => void,
}) {
    return <div className='flex text-center text-dimmed border-2 border-dimmed no-underline cursor-pointer transition-all duration-300 hover:text-highlight hover:border-highlight rounded-sm font-bold py-sm px-base' onClick={onClick}>
        {
            !icon ? null :
                <div className='mr-base'><Icon name={icon} /></div>
        }
        {text}
    </div>
}