import React from "react";
import { useAuth, useSignInOptions } from '../app';
import { meter } from "../controls/theme";
import { Menu, MenuItem } from "../controls/Menu";

export function SignInPanel() {
    const state = useAuth();
    switch (state.state) {
        case 'signed':
            return <UserMenu
                name={state.name}
            />;
        case 'not-signed':
            return <SignInMenu />;
        default:
            return null;
    }
}

function UserMenu({ name }: {
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

function SignInMenu() {
    const { signWithFacebook } = useSignInOptions();
    return <div>
        <span>Sign In</span>
        <Menu>
            <MenuItem
                icon="facebook"
                text="Facebook"
                callback={signWithFacebook}
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
