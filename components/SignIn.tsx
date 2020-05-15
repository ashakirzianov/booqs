import React, { useState } from "react";
import { loginFb } from '../lib';
import { useAuth, useSignInOption } from '../app';
import { meter } from "../controls/theme";
import { Menu, MenuItem } from "../controls/Menu";

export function SignInPanel() {
    const state = useAuth();
    console.log(state);
    switch (state.state) {
        case 'signed':
            return <UserMenu />;
        case 'not-signed':
            return <SignInMenu />;
        default:
            return null;
    }
}

function UserMenu() {
    return <div>
        <span>Welcome</span>
        <Menu>
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
    const { signWithFacebook } = useSignInOption();
    function facebook() {
        loginFb().then(
            status =>
                status.status === 'connected'
                    ? signWithFacebook(status.authResponse.accessToken)
                    : undefined
        );
    }
    return <div>
        <span>Sign In</span>
        <Menu>
            <MenuItem
                icon="facebook"
                text="Facebook"
                callback={facebook}
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
