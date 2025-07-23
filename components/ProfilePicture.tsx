import { ProfileIcon } from '@/components/Icons'

export function ProfileBadge({
    picture, name, emoji, size, border,
}: {
    picture?: string,
    name?: string,
    emoji?: string,
    size: number,
    border: boolean,
}) {
    if (picture) {
        return <ProfilePicture
            picture={picture}
            size={size}
            border={border}
        />
    } else {
        const display = emoji || (name ? getInitials(name) : 'X')
        return <ProfilePicturePlaceholder
            display={display}
            size={size}
            border={border}
        />
    }
}

function ProfilePicture({ picture, size, border }: {
    picture: string,
    size: number,
    border: boolean,
}) {
    return <div className='text-xl flex shrink-0 overflow-hidden hover:border-highlight' style={{
        borderRadius: '50%',
        border: border ? `1.5px solid var(--color-dimmed)` : 'none',
        width: `${size}rem`,
        height: `${size}rem`,
        backgroundImage: `url(${picture})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        transition: '250ms border',
    }}>
    </div>
}

function ProfilePicturePlaceholder({ display, size }: {
    display: string,
    size: number,
    border: boolean,
}) {
    return <div className='container font-bold text-xl flex items-center justify-start p-0 overflow-hidden text-dimmed hover:border-highlight grow-0 shrink-0' style={{
        width: `${size}rem`,
        height: `${size}rem`,
        transition: '250ms color, 250ms border',
        fontSize: `${size / 2}rem`,
    }}>
        {display}
    </div>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProfilePictureIcon() {
    return <ProfileIcon />
}

function getInitials(name: string) {
    const names = name.split(' ')
    const first = names[0]
    const last = names.length > 1
        ? names[names.length - 1]
        : ''
    return (first?.charAt(0) ?? '') + (last?.charAt(0) ?? '')
}