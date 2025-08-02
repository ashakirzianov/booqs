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

export function IconButton({ children, onClick, className = '', disabled = false, variant = 'default', title }: {
    children: React.ReactNode,
    onClick?: () => void,
    className?: string,
    disabled?: boolean,
    variant?: 'default' | 'danger',
    title?: string,
}) {
    const variantClasses = {
        default: 'text-dimmed hover:text-primary hover:bg-dimmed/20',
        danger: 'text-alert hover:bg-alert/10'
    }

    return <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
        {children}
    </button>
}

export function ActionButton({ children, onClick, className = '', disabled = false, loading = false, variant = 'primary' }: {
    children: React.ReactNode,
    onClick?: () => void,
    className?: string,
    disabled?: boolean,
    loading?: boolean,
    variant?: 'primary' | 'secondary',
}) {
    const variantClasses = {
        primary: 'bg-action text-white hover:bg-highlight',
        secondary: 'border border-dimmed text-primary hover:bg-dimmed/10'
    }

    return <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${variantClasses[variant]} ${className}`}
    >
        {loading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
        )}
        {children}
    </button>
}

export function FollowButton({ isFollowing, onClick, disabled = false, loading = false, className = '' }: {
    isFollowing: boolean,
    onClick?: () => void,
    disabled?: boolean,
    loading?: boolean,
    className?: string,
}) {
    return <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed transform ${isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-[1.02]'
            : 'bg-action text-white hover:bg-highlight hover:text-background hover:scale-[1.02]'
            } ${loading
                ? 'opacity-90 scale-[0.98]'
                : 'opacity-100 scale-100'
            } ${className}`}
    >
        <span className="flex items-center gap-1">
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
            )}
            {isFollowing ? (
                <span>Unfollow</span>
            ) : (
                <>
                    <span>+</span>
                    <span>Follow</span>
                </>
            )}
        </span>
    </button>
}

export function SubmitButton({ children, disabled = false, loading = false, className = '', variant = 'primary' }: {
    children: React.ReactNode,
    disabled?: boolean,
    loading?: boolean,
    className?: string,
    variant?: 'primary' | 'secondary',
}) {
    const variantClasses = {
        primary: 'bg-action text-white hover:bg-highlight',
        secondary: 'border border-dimmed text-primary hover:bg-dimmed/10'
    }

    return <button
        type="submit"
        disabled={disabled || loading}
        className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variantClasses[variant]} ${className}`}
    >
        {loading && (
            <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
        )}
        <span>{children}</span>
    </button>
}