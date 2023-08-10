'use client'
import React, { useState } from 'react'
import { Menu, MenuItem } from '@/components/Menu'
import { IconButton } from '@/components/Buttons'
import { ProfileBadge } from '@/components/ProfilePicture'
import { ModalButton, ModalDivider, ModalLabel, Modal } from '@/components/Modal'
import { User, useAuth, useSignInOptions } from '@/application/auth'
import { Popover } from '@/components/Popover'
import { useIsMounted } from '@/application/utils'
import { Spinner } from '@/components/Loading'

export function useSignInModal() {
    let [isOpen, setIsOpen] = useState(false)
    function openModal() {
        setIsOpen(true)
    }
    function closeModal() {
        setIsOpen(false)
    }
    const { signWithApple, signWithFacebook } = useSignInOptions()
    const ModalContent = <Modal
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
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Facebook'
                icon='facebook'
                onClick={() => {
                    signWithFacebook()
                    closeModal()
                }}
            />
            <ModalDivider />
            <ModalButton
                text='Dismiss'
                onClick={closeModal}
            />
        </div>
    </Modal>
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
