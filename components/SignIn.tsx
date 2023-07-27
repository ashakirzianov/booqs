'use client'
import React from 'react'
import { Menu, MenuItem } from '@/components/Menu'
import { IconButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { useModal } from '@/components/Modal'
import { useAuth, useSignInOptions } from '@/application/auth'

export function useSignInModal() {
    const { signWithApple, signWithFacebook } = useSignInOptions()
    const { openModal, ModalContent } = useModal(({ closeModal }) => ({
        body: <div className='flex flex-col items-center max-w-[100vw] w-60 p-lg'>
            Choose provider
        </div>,
        buttons: [
            {
                text: 'Apple',
                icon: 'apple',
                onClick() {
                    signWithApple()
                    closeModal()
                },
            },
            {
                text: 'Facebook',
                icon: 'facebook',
                onClick() {
                    signWithFacebook()
                    closeModal()
                },
            },
            {
                text: 'Dismiss',
                onClick: closeModal,
            },
        ],
    }))
    return {
        openModal,
        ModalContent,
    }
}

export function SignIn() {
    return <SingInButton />
}

function SingInButton() {
    const state = useAuth()
    const { openModal, ModalContent } = useSignInModal()
    return <>
        <div className='cursor-pointer'>
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
    </>
}

function SignInPanel() {
    const state = useAuth()
    if (state?.signed) {
        return <Signed
            name={state.name}
        />
    } else {
        return <NotSigned />
    }
}

function Signed({ name }: {
    name?: string,
}) {
    const { signOut } = useSignInOptions()
    return <div className='py-base flex flex-col flex-1 items-stretch'>
        <span className='p-base w-full text-center font-bold'>{name}</span>
        <Menu>
            <MenuItem
                icon='sign-out'
                text='Sing Out'
                callback={signOut}
                spinner={false}
            />
        </Menu>
    </div>
}

function NotSigned() {
    return <div className='py-base flex flex-col flex-1 items-stretch'>
        <span className='p-base w-full text-center font-bold'>Sign In</span>
    </div>
}
