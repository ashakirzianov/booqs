import { AccountDisplayData } from '@/core'

export function Avatar({ user }: { user?: AccountDisplayData }) {
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'X'

    return (
        <div className="w-3 h-3 rounded-full bg-dimmed text-white flex items-center justify-center text-[0.5rem] font-semibold flex-shrink-0">
            {initial}
        </div>
    )
}