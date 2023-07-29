'use client'
import React from 'react'
import { Menu, MenuItem } from '@/components/Menu'
import { IconButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { useModal } from '@/components/Modal'
import { User, useAuth, useSignInOptions } from '@/application/auth'
import { Popover } from './Popover'
import { useIsMounted } from '@/application/utils'
import { Spinner } from './Loading'

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
    const state = useAuth()
    const mounted = useIsMounted()

    if (!mounted) {
        return <Spinner />
    }

    return <div className='cursor-pointer'>
        {
            state?.signed
                ? <SignedButton
                    user={state}
                />
                : <NotSignedButton />
        }
    </div>
}

function SignedButton({ user }: {
    user: User,
}) {
    return <Popover
        content={<Signed
            name={user.name}
        />}
        anchor={<ProfileBadge
            name={user.name}
            picture={user.pictureUrl ?? undefined}
            size={2}
            border={true}
        />}
    />
}

function NotSignedButton() {
    const { openModal, ModalContent } = useSignInModal()
    return <>
        <IconButton
            icon='sign-in'
            onClick={openModal} />
        {ModalContent}
    </>
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
