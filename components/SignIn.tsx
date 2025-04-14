'use client'
import React, { useState } from 'react'
import { Menu, MenuItem } from '@/components/Menu'
import { IconButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ModalButton, ModalDivider, ModalLabel, Modal } from '@/components/Modal'
import { Popover } from '@/components/Popover'
import { Spinner } from '@/components/Loading'
import { accountHref, myBooqsHref } from '@/components/Links'
import { useRouter } from 'next/navigation'
import { AuthUser, useAuth } from '@/application/auth'

export function SignInModal({ isOpen, closeModal }: {
    isOpen: boolean,
    closeModal: () => void,
}) {
    const { registerWithPasskey, signInWithPasskey } = useAuth()
    // TODO: do we need this?
    const router = useRouter()
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='flex flex-col items-center max-w-[100vw] w-60'>
            <ModalLabel text='Choose provider' />
            <ModalDivider />
            <ModalButton
                text='Register with Passkey'
                icon='new-passkey'
                onClick={() => {
                    registerWithPasskey()
                    closeModal()
                    router.refresh()
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Sign in with Passkey'
                icon='signin-passkey'
                onClick={() => {
                    signInWithPasskey()
                    closeModal()
                    router.refresh()
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </div>
    </Modal>
}

export function SignInButton() {
    const { auth } = useAuth()

    if (auth.state === 'loading') {
        return <Spinner />
    }

    return <div className='cursor-pointer'>
        {
            auth.state === 'signed'
                ? <SignedButton
                    user={auth.user}
                />
                : <NotSignedButton />
        }
    </div>
}

function SignedButton({ user }: {
    user: AuthUser,
}) {
    return <Popover
        content={<AccountMenu
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
    const [isOpen, setIsOpen] = useState(false)
    return <>
        <IconButton
            icon='sign-in'
            onClick={() => setIsOpen(true)} />
        <SignInModal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
        />
    </>
}

function AccountMenu({ name }: {
    name?: string,
}) {
    const { signOut } = useAuth()
    const router = useRouter()
    return <div className='flex flex-col flex-1 items-stretch'>
        <span className='p-4 w-full text-center font-bold'>{name}</span>
        <Menu>
            <MenuItem
                text='My Booqs'
                icon='books'
                href={myBooqsHref()}
            />
            <MenuItem
                text='Settings'
                icon='settings'
                href={accountHref()}
            />
            <MenuItem
                icon='sign-out'
                text='Sing Out'
                callback={() => {
                    signOut()
                    router.refresh()
                }}
                spinner={false}
            />
        </Menu>
    </div>
}
