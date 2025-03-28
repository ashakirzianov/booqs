'use client'
import React, { useState } from 'react'
import { User, useAuth, useSocialSignIn } from '@/application/auth'
import { useIsMounted } from '@/application/utils'
import { Menu, MenuItem } from '@/components/Menu'
import { IconButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ModalButton, ModalDivider, ModalLabel, Modal } from '@/components/Modal'
import { Popover } from '@/components/Popover'
import { Spinner } from '@/components/Loading'
import { accountHref, myBooqsHref } from '@/components/Links'
import { useRouter } from 'next/navigation'

export function SignInModal({ isOpen, closeModal }: {
    isOpen: boolean,
    closeModal: () => void,
}) {
    const { signWithApple, signWithFacebook } = useSocialSignIn()
    let router = useRouter()
    return <Modal
        isOpen={isOpen}
        closeModal={closeModal}
    >
        <div className='flex flex-col items-center max-w-[100vw] w-60'>
            <ModalLabel text='Choose provider' />
            <ModalDivider />
            <ModalButton
                text='Apple'
                icon='apple'
                onClick={() => {
                    signWithApple()
                    closeModal()
                    router.refresh()
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Facebook'
                icon='facebook'
                onClick={() => {
                    signWithFacebook()
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
    let [isOpen, setIsOpen] = useState(false)
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
    const { signOut } = useSocialSignIn()
    let router = useRouter()
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
