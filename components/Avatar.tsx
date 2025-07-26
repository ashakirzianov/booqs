import { NoteAuthorData } from '@/data/notes'

export function Avatar({ user }: { user?: NoteAuthorData }) {
    const display = user?.emoji || (user?.name ? user.name.charAt(0).toUpperCase() : 'X')

    return (
        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[0.5rem] font-semibold flex-shrink-0 leading-none">
            {display}
        </div>
    )
}