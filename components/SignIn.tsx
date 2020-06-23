import React from "react";
import { useSignInOptions, useAuth } from 'app';
import { meter, vars } from "controls/theme";
import { Menu, MenuItem } from "controls/Menu";
import { IconButton, BorderButton } from "controls/Buttons";
import { PopoverSingleton, Popover } from "controls/Popover";
import { ProfileBadge } from "controls/ProfilePicture";

export function FacebookSignButton() {
    const { signWithFacebook } = useSignInOptions();
    return <BorderButton
        icon='facebook'
        text='Facebook'
        onClick={signWithFacebook}
    />;
}

export function SignInMenu() {
    const { provider } = useAuth() ?? {};
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
    singleton?: PopoverSingleton,
}) {
    return <Popover
        singleton={singleton}
        anchor={<SingInButton />}
        content={<SignInPanel />}
    />;
}

function SingInButton() {
    const state = useAuth();
    return <div style={{
        cursor: 'pointer'
    }}>
        {
            state?.signed
                ? <ProfileBadge
                    name={state.name}
                    picture={state.pictureUrl ?? undefined}
                    size={36}
                    border={true}
                />
                : <IconButton
                    icon='sign-in'
                />
        }
    </div>;
}

function SignInPanel() {
    const state = useAuth();
    if (state?.signed) {
        return <Signed
            name={state.name}
        />;
    } else {
        return <NotSigned />;
    }
}

function Signed({ name }: {
    name: string,
}) {
    const { provider } = useAuth() ?? {};
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
