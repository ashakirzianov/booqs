'use client'
import React, { useState } from 'react'
import { Menu, MenuItem } from '@/components/Menu'
import { PanelButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ModalButton, ModalDivider, ModalLabel, Modal } from '@/components/Modal'
import { Popover } from '@/components/Popover'
import { accountHref, myBooqsHref } from '@/common/href'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/application/auth'
import { usePasskeys } from '@/application/passkeys'
import {
    BookIcon, NewItemIcon, PasskeyIcon, SettingsIcon, SignInIcon, SignOutIcon, Spinner,
} from '@/components/Icons'
import { AccountData } from '@/data/user'

export function SignInModal({ isOpen, closeModal }: {
    isOpen: boolean,
    closeModal: () => void,
}) {
    const { registerPasskey, signInWithPasskey } = usePasskeys()
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
                icon={<NewItemIcon />}
                onClick={async () => {
                    try {
                        await registerPasskey()
                        closeModal()
                        router.refresh()
                    } catch (error) {
                        console.error('Failed to register passkey:', error)
                    }
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Sign in with Passkey'
                icon={<PasskeyIcon />}
                onClick={async () => {
                    try {
                        await signInWithPasskey()
                        closeModal()
                        router.refresh()
                    } catch (error) {
                        console.error('Failed to sign in with passkey:', error)
                    }
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
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return <Spinner />
    }

    return <div className='cursor-pointer'>
        {
            user
                ? <SignedButton
                    user={user}
                />
                : <NotSignedButton />
        }
    </div>
}

function SignedButton({ user }: {
    user: AccountData,
}) {
    return <Popover
        content={<AccountMenu
            name={user.name}
        />}
        anchor={<ProfileBadge
            name={user.name}
            picture={user.profilePictureURL ?? undefined}
            emoji={user.emoji}
            size={2}
            border={true}
        />}
    />
}

function NotSignedButton() {
    const [isOpen, setIsOpen] = useState(false)
    return <>
        <PanelButton
            onClick={() => setIsOpen(true)} >
            <SignInIcon />
        </PanelButton>
        <SignInModal
            isOpen={isOpen}
            closeModal={() => setIsOpen(false)}
        />
    </>
}

function AccountMenu({ name }: {
    name: string | undefined,
}) {
    const { signOut } = useAuth()
    const router = useRouter()
    return <div className='flex flex-col flex-1 items-stretch'>
        <span className='p-4 w-full text-center font-bold'>{name}</span>
        <Menu>
            <MenuItem
                text='My Booqs'
                icon={<BookIcon />}
                href={myBooqsHref()}
            />
            <MenuItem
                text='Settings'
                icon={<SettingsIcon />}
                href={accountHref()}
            />
            <MenuItem
                icon={<SignOutIcon />}
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
