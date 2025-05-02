import clsx from 'clsx'
import React from 'react'

export function ActionButtonWrapper({ children }: {
    children: React.ReactNode,
}) {
    return <div className='text-dimmed hover:text-highlight'>
        {children}
    </div>
}

export function Button({ children, onClick, selected }: {
    children?: React.ReactNode,
    onClick?: () => void,
    selected?: boolean,
}) {
    return <button
        className={clsx('button flex text-dimmed text-2xl cursor-pointer transition duration-150 bg-transparent hover:text-highlight focus:outline-hidden w-8 h-8 justify-center items-center', {
            'text-highlight': selected,
            'text-dimmed': !selected,
        })}
        onClick={onClick}
    >
        {children}
    </button>
}

export function BorderButton({ text, onClick }: {
    text: string,
    onClick?: () => void,
}) {
    return <div className='flex text-center text-dimmed border-2 border-dimmed no-underline cursor-pointer transition-all duration-300 hover:text-highlight hover:border-highlight rounded-sm font-bold py-sm px-base' onClick={onClick}>
        {text}
    </div>
}