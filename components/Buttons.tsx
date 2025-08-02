import clsx from 'clsx'
import React from 'react'
import { TrashIcon } from './Icons'

export function LightButton({
    icon, text,
    onClick,
    disabled = false,
    size = 'normal',
}: {
    icon: React.ReactNode,
    text: string,
    onClick?: () => void,
    disabled?: boolean,
    size?: 'small' | 'normal' | 'large',
}) {
    const sizeClasses = {
        small: 'gap-1 text-sm',
        normal: 'gap-2',
        large: 'gap-3 text-lg'
    }

    return <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
            'flex items-center text-action hover:text-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            sizeClasses[size]
        )}
    >
        <div className="w-4 h-4">
            {icon}
        </div>
        {text}
    </button>
}

export function ActionButton({
    text, icon,
    onClick,
    variant,
    size = 'normal',
    full,
    width,
    disabled = false,
    hasError = false,
}: {
    text: string,
    icon?: React.ReactNode,
    variant: 'primary' | 'secondary' | 'alert',
    size?: 'small' | 'normal' | 'large',
    onClick?: () => void,
    width?: string,
    disabled?: boolean,
    full?: boolean,
    hasError?: boolean,
}) {
    return <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
            'rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center content-center cursor-pointer',
            {
                'bg-action text-white hover:bg-highlight': variant === 'primary',
                'border border-dimmed text-dimmed hover:bg-dimmed/10': variant === 'secondary',
                'text-alert border border-alert hover:bg-alert hover:text-background': variant === 'alert',
                'px-3 py-1.5 text-sm gap-1': size === 'small',
                'px-4 py-2 gap-2': size === 'normal',
                'px-6 py-3 text-lg gap-3': size === 'large',
                'w-full': full,
                'ring-2 ring-red-500 ring-opacity-50': hasError,
            }
        )}
        style={{
            width: width ? width : undefined,
        }}
    >
        {icon && (
            <div className="w-4 h-4">
                {icon}
            </div>
        )}
        {text}
    </button>
}

export function PanelButton({
    children, onClick, selected,
}: {
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

export function RemoveButton({
    isRemoving, onClick, title,
}: {
    onClick: () => void,
    title: string,
    isRemoving: boolean,
}) {
    return <button
        onClick={onClick}
        disabled={isRemoving}
        title={title}
        className={clsx(
            'p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-alert hover:bg-alert/10 cursor-pointer'
        )}
    >
        <div className="w-4 h-4">
            {isRemoving ? (
                <div className="animate-spin border-b-2 border-alert"></div>
            ) : (
                <TrashIcon />
            )}
        </div>
    </button>
}