import React from "react";
import { useSignInOptions, usePalette, useAuth } from 'app';
import { meter } from "controls/theme";
import { Menu, MenuItem } from "controls/Menu";
import { IconButton, BorderButton } from "controls/Buttons";
import { PopoverSingleton, Popover } from "controls/Popover";

export function FacebookSignButton() {
    const { signWithFacebook } = useSignInOptions();
    return <BorderButton
        icon='facebook'
        text='Facebook'
        onClick={signWithFacebook}
    />;
}

export function SignInMenu() {
    const { provider } = useAuth();
    const { signWithFacebook } = useSignInOptions();
    return <Menu>
        <MenuItem
            icon="facebook"
            text="Facebook"
            callback={signWithFacebook}
            spinner={provider === 'facebook'}
        />
    </Menu>;
}

export function SignIn({ singleton }: {
    singleton: PopoverSingleton,
}) {
    return <Popover
        singleton={singleton}
        anchor={<SingInButton />}
        content={<SignInPanel />}
    />;
}

function SingInButton() {
    const state = useAuth();
    if (state.state === 'signed') {
        return state.profilePicture
            ? <ProfilePictureButton
                picture={state.profilePicture}
            />
            : <IconButton
                icon='user'
            />
    } else {
        return <IconButton
            icon='sign-in'
        />;
    }
}

function SignInPanel() {
    const state = useAuth();
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

function Signed({ name }: {
    name: string,
}) {
    const { provider } = useAuth();
    const { signOut } = useSignInOptions();
    return <div>
        <span>{name}</span>
        <Menu>
            <MenuItem
                icon='sign-out'
                text='Sing Out'
                callback={signOut}
                spinner={!provider}
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
