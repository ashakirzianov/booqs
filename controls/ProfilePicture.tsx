import { vars, boldWeight } from "./theme";

export function ProfileBadge({
    picture, name, size, border,
}: {
    picture?: string,
    name?: string,
    size: number,
    border: boolean,
}) {
    if (picture) {
        return <ProfilePicture
            picture={picture}
            size={size}
            border={border}
        />;
    } else {
        const initials = name
            ? getInitials(name)
            : 'X';
        return <ProfilePicturePlaceholder
            initials={initials}
            size={size}
            border={border}
        />;
    }
}

function ProfilePicture({ picture, size, border }: {
    picture: string,
    size: number,
    border: boolean,
}) {
    return <div className='container'>
        <style jsx>{`
            .container {
                font-size: x-large;
                display: flex;
                flex-shrink: 0;
                border-radius: 50%;
                border: ${border ? `1.5px solid var(${vars.dimmed})` : 'none'};
                width: ${size}rem;
                height: ${size}rem;
                overflow: hidden;
                background-image: url(${picture});
                background-size: cover;
                background-repeat: no-repeat;
                transition: 250ms border;
            }
            .container:hover {
                border: ${border ? `1.5px solid var(${vars.highlight})` : 'none'};
            }
            `}</style>
    </div>;
}

function ProfilePicturePlaceholder({ initials, size, border }: {
    initials: string,
    size: number,
    border: boolean,
}) {
    return <div className='container'>
        {initials}
        <style jsx>{`
            .container {
                font-size: x-large;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                flex-shrink: 0;
                border-radius: 50%;
                border: ${border ? `1.5px solid var(${vars.dimmed})` : 'none'};
                width: ${size}rem;
                height: ${size}rem;
                overflow: hidden;
                background: var(${vars.background});
                color: var(${vars.dimmed});
                font-size: ${size / 2}rem;
                font-weight: ${boldWeight};
                transition: 250ms color, 250ms border;
            }
            .container:hover {
                border: ${border ? `1.5px solid var(${vars.highlight})` : 'none'};
                color: var(${vars.highlight});
            }
            `}</style>
    </div>;
}

function getInitials(name: string) {
    const names = name.split(' ');
    const first = names[0];
    const last = names.length > 1
        ? names[names.length - 1]
        : '';
    return (first?.charAt(0) ?? '') + (last?.charAt(0) ?? '');
}