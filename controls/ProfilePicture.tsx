import { vars, boldWeight } from "./theme";

export function ProfileBadge({ picture, name, size }: {
    picture?: string,
    name: string,
    size: number,
}) {
    if (picture) {
        return <ProfilePicture
            picture={picture}
            size={size}
        />;
    } else {
        const letter = name.substr(0, 1);
        return <ProfilePicturePlaceholder
            letter={letter}
            size={size}
        />;
    }
}

function ProfilePicture({ picture, size }: {
    picture: string,
    size: number,
}) {
    return <div className='container'>
        <style jsx>{`
            .container {
                font-size: x-large;
                display: flex;
                flex-shrink: 0;
                border-radius: 50%;
                border: 1.5px solid var(${vars.dimmed});
                width: ${size}px;
                height: ${size}px;
                overflow: hidden;
                background-image: url(${picture});
                background-size: cover;
                background-repeat: no-repeat;
                cursor: pointer;
                transition: 250ms border;
            }
            .container:hover {
                border: 1.5px solid var(${vars.highlight});
            }
            `}</style>
    </div>;
}

function ProfilePicturePlaceholder({ letter, size }: {
    letter: string,
    size: number,
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
                border: 1.5px solid var(${vars.dimmed});
                width: ${size}px;
                height: ${size}px;
                overflow: hidden;
                background: var(${vars.background});
                color: var(${vars.dimmed});
                font-size: ${size / 2}px;
                font-weight: ${boldWeight};
                cursor: pointer;
                transition: 250ms color, 250ms border;
            }
            .container:hover {
                border: 1.5px solid var(${vars.highlight});
                color: var(${vars.highlight});
            }
            `}</style>
    </div>;
}