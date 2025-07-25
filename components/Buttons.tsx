import clsx from 'clsx'
import React from 'react'

type ButtonProps = {
    children?: React.ReactNode,
    onClick?: () => void,
    selected?: boolean,
}
export function PanelButton({
    children, onClick, selected,
}: ButtonProps) {
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

export function BorderButton({ text, onClick, color = 'primary', disabled = false, className = '' }: {
    text: string,
    onClick?: () => void,
    color?: 'primary' | 'alert',
    disabled?: boolean,
    className?: string,
}) {
    const colorClasses = {
        primary: 'text-primary border-primary hover:bg-primary hover:text-background',
        alert: 'text-alert border-alert hover:bg-alert hover:text-background'
    }
    
    return <button 
        className={`px-4 py-2 font-medium border rounded-md transition-colors duration-200 ${colorClasses[color]} ${disabled ? 'disabled:opacity-50' : ''} ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        {text}
    </button>
}

export function LightButton({ children, onClick, className = '', disabled = false }: {
    children: React.ReactNode,
    onClick?: () => void,
    className?: string,
    disabled?: boolean,
}) {
    return <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-action hover:text-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
}

export function MenuButton({
    onClick,
    children,
}: {
    onClick: () => void,
    children: React.ReactNode,
}) {
    return (
        <button
            className="flex items-center gap-1 text-sm font-bold cursor-pointer text-dimmed hover:text-highlight hover:underline"
            onClick={onClick}
            onMouseDown={e => e.preventDefault()}
        >
            {children}
        </button>
    )
}