export function MenuButton({
    onClick,
    children,
}: {
    onClick: () => void,
    children: React.ReactNode,
}) {
    return (
        <button
            className="flex items-start gap-1 text-sm cursor-pointer text-dimmed hover:text-highlight hover:underline"
            onClick={onClick}
            onMouseDown={e => e.preventDefault()}
        >
            {children}
        </button>
    )
}