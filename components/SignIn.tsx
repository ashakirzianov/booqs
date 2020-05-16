import React from "react";
import { useSignInOptions, Auth, usePalette } from '../app';
import { meter, buttonSize } from "../controls/theme";
import { Menu, MenuItem } from "../controls/Menu";
import { IconButton } from "../controls/Buttons";

export function SignInMenu() {
    const { signWithFacebook } = useSignInOptions();
    return <Menu>
        <MenuItem
            icon="facebook"
            text="Facebook"
            callback={signWithFacebook}
        />
    </Menu>;
}

export function SingInButton({ state: { name, profilePicture } }: {
    state: Auth,
}) {
    if (profilePicture) {
        return <ProfilePictureButton
            picture={profilePicture}
        />;
    } else if (name) {
        return <IconButton
            icon='user'
        />;
    } else {
        return <IconButton
            icon='sign-in'
        />;
    }
}

function ProfilePictureButton({ picture }: {
    picture: string,
}) {
    const { dimmed, highlight } = usePalette();
    return <div className='container'>
        <style jsx>{`
            .container {
                font-size: x-large;
                display: flex;
                flex-shrink: 0;
                border-radius: 50%;
                border: 1px solid ${dimmed};
                width: 37px;
                height: 37px;
                overflow: hidden;
                background-image: url(${picture});
                background-size: cover;
                background-repeat: no-repeat;
                cursor: pointer;
            }
            .container:hover {
                border: 1px solid ${highlight};
            }
            `}</style>
    </div>;
}

export function SignInPanel({ state }: {
    state: Auth,
}) {
    switch (state.state) {
        case 'signed':
            return <Signed
                name={state.name}
            />;
        case 'not-signed':
            return <NotSigned />;
        default:
            return null;
    }
}

function Signed({ name }: {
    name: string,
}) {
    const { signOut } = useSignInOptions();
    return <div>
        <span>{name}</span>
        <Menu>
            <MenuItem
                icon='sign-out'
                text='Sing Out'
                callback={signOut}
            />
        </Menu>
        <style jsx>{`
        div {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: ${meter.regular} 0;
            align-items: stretch;
        }
        span {
            width: 100%;
            text-align: center;
            font-weight: bold;
            padding: ${meter.regular};
        }
        `}</style>
    </div>;
}

function NotSigned() {
    return <div>
        <span>Sign In</span>
        <SignInMenu />
        <style jsx>{`
        div {
            display: flex;
            flex-direction: column;
            flex: 1;
            padding: ${meter.regular} 0;
            align-items: stretch;
        }
        span {
            width: 100%;
            text-align: center;
            font-weight: bold;
            padding: ${meter.regular};
        }
        `}</style>
    </div>;
}
