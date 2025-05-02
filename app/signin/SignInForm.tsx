'use client'
import { registerWithPasskey, signInWithPasskey } from '@/application/auth'
import { PasskeyIcon, NewItemIcon } from '@/components/Icons'
import { Spinner } from '@/components/Loading'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export function SignInForm({ returnTo }: {
    returnTo: string,
}) {
    const [state, setState] = useState<{
        state: 'idle',
    } | {
        state: 'loading',
    } | {
        state: 'signed',
        user: any,
    } | {
        state: 'error',
        error: string,
    }>({ state: 'idle' })
    return <form className='flex flex-col items-center justify-start gap-4 w-full'>
        <h1 className='text-center text-2xl'>Sign in or register</h1>
        <Button onClick={async function () {
            setState({ state: 'loading' })
            const result = await registerWithPasskey()
            if (result.success) {
                redirect(returnTo)
            } else {
                setState({
                    state: 'error',
                    error: result.error,
                })
            }
        }}>
            <NewItemIcon />
            <span>Register with Passkey</span>
        </Button>
        <Button onClick={async function () {
            setState({ state: 'loading' })
            const result = await signInWithPasskey()
            if (result.success) {
                redirect(returnTo)
            } else {
                setState({
                    state: 'error',
                    error: result.error,
                })
            }
        }}>
            <PasskeyIcon />
            <span>Sign in with Passkey</span>
        </Button>
        {state.state === 'loading' ? <Spinner /> : null}
        {
            state.state === 'error' ? <div className='text-alert text-sm'>{state.error}</div> : null
        }
    </form>
}

function Button({ children, onClick, disabled }: {
    children: React.ReactNode,
    onClick?: () => void,
    disabled?: boolean,
}) {
    return <button className='text-action hover:text-highlight flex gap-2 items-center' type='button' onClick={onClick} disabled={disabled}>
        {children}
    </button>
}