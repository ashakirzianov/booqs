import React from "react";
import { useSignInOptions, useAuth } from 'app';
import { meter } from "controls/theme";
import { Menu, MenuItem } from "controls/Menu";
import { IconButton } from "controls/Buttons";
import { PopoverSingleton, Popover } from "controls/Popover";
import { ProfileBadge } from "controls/ProfilePicture";
import { useModal } from "controls/Modal";

export function useSignInModal() {
    const { signWithApple, signWithFacebook } = useSignInOptions();
    const { openModal, ModalContent } = useModal(({ closeModal }) => ({
        body: <div className='content'>
            Choose provider
            <style jsx>{`
                .content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 15rem;
                    max-width: 100vw;
                    padding: ${meter.large};
                }
                `}</style>
        </div>,
        buttons: [
            {
                text: 'Apple',
                icon: 'apple',
                onClick() {
                    signWithApple();
                    closeModal();
                },
            },
            {
                text: 'Facebook',
                icon: 'facebook',
                onClick() {
                    signWithFacebook();
                    closeModal();
                },
            },
            {
                text: 'Dismiss',
                onClick: closeModal,
            },
        ],
    }));
    return {
        openModal,
        ModalContent,
    };
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
    const { openModal, ModalContent } = useSignInModal();
    return <>
        <div style={{
            cursor: 'pointer'
        }}>
            {
                state?.signed
                    ? <ProfileBadge
                        name={state.name}
                        picture={state.pictureUrl ?? undefined}
                        size={2}
                        border={true}
                    />
                    : <IconButton
                        icon='sign-in'
                        onClick={openModal}
                    />
            }
        </div>
        {ModalContent}
    </>;
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
    const { signOut } = useSignInOptions();
    return <div>
        <span>{name}</span>
        <Menu>
            <MenuItem
                icon='sign-out'
                text='Sing Out'
                callback={signOut}
                spinner={false}
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
