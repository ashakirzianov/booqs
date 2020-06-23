import { vars, boldWeight } from "./theme";

export function ProfileBadge({
    picture, name, size, border,
}: {
    picture?: string,
    name: string,
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
        const letter = name.substr(0, 1);
        return <ProfilePicturePlaceholder
            letter={letter}
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
                width: ${size}px;
                height: ${size}px;
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

function ProfilePicturePlaceholder({ letter, size, border }: {
    letter: string,
    size: number,
    border: boolean,
}) {
    return <div className='container'>
        {letter}
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
                width: ${size}px;
                height: ${size}px;
                overflow: hidden;
                background: var(${vars.background});
                color: var(${vars.dimmed});
                font-size: ${size / 2}px;
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