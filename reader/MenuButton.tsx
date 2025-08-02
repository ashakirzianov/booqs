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