import { Logo } from '@/components/Logo'
import { getRandomAvatarEmoji } from '@/core/emoji'
import { SignUpForm } from './SignUpForm'

export default async function SignUpPage({ searchParams }: {
    searchParams: Promise<{
        email?: string,
        secret?: string,
        return_to?: string,
    }>
}) {
    const { email, secret, return_to } = await searchParams
    const returnTo = return_to ?? '/'

    // Server-side validation - if missing parameters, show error
    if (!email || !secret) {
        return (
            <main className='flex flex-col items-center justify-center h-screen gap-8 p-16'>
                <Logo style={{ fontSize: 'xxx-large' }} />
                <div className='flex flex-col items-center gap-4 max-w-md text-center'>
                    <h1 className='text-2xl font-bold text-alert'>Invalid Sign-up Link</h1>
                    <p className='text-lg'>Missing email or secret parameter</p>
                    <p className='text-sm text-secondary'>
                        The sign-up link may be malformed or incomplete.
                    </p>
                </div>
                <a 
                    href="/auth" 
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors'
                >
                    Go to Sign In
                </a>
            </main>
        )
    }

    // Server-side preparation of initial values
    const initialUsername = email.split('@')[0]
    const initialEmoji = getRandomAvatarEmoji()

    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Logo style={{ fontSize: 'xxx-large' }} />
            
            <div className='w-full max-w-md'>
                <h1 className='text-2xl font-bold text-center mb-8'>Complete Sign Up</h1>
                
                <SignUpForm
                    email={email}
                    secret={secret}
                    initialUsername={initialUsername}
                    initialEmoji={initialEmoji}
                    returnTo={returnTo}
                />
            </div>
        </main>
    )
}