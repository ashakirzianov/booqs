import React from 'react'

export function TabButton({
    text,
    selected,
    onClick,
}: {
    text: string,
    selected: boolean,
    onClick: () => void,
}) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-2 text-xs transition-colors cursor-pointer
                hover:text-primary relative
                ${selected ? 'text-primary font-medium' : 'text-dimmed'}
            `}
        >
            <span>{text}</span>
            {selected && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
        </button>
    )
}