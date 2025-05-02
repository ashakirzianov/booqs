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
    const selectedClass = selected
        ? 'text-highlight' : 'text-dimmed'
    return <button
        className={`button flex text-dimmed text-2xl cursor-pointer transition bg-transparent hover:text-highlight focus:outline-hidden ${selectedClass} w-8 h-8 justify-center items-center`}
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