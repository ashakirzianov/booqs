import { Logo } from '@/components/Logo'
import { getRandomAvatarEmoji } from '@/core/emoji'
import { prevalidateSignupAction, fetchAuthData } from '@/data/auth'
import { SignUpForm } from './SignUpForm'
import { generateRandomName } from './name'

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
            <SignUpErrorPage 
                title="Invalid Sign-up Link"
                message="Missing email or secret parameter"
                description="The sign-up link may be malformed or incomplete."
            />
        )
    }

    // Check if user is already authenticated (sign-up completed)
    const authData = await fetchAuthData()
    const isAuthenticated = !!authData

    // Only pre-validate if user is not authenticated yet
    if (!isAuthenticated) {
        const validation = await prevalidateSignupAction({ email, secret })
        
        if (!validation.success) {
            return (
                <SignUpErrorPage 
                    title="Sign-up Link Invalid"
                    message={validation.reason}
                    description="Please request a new sign-up link or try signing in if you already have an account."
                />
            )
        }
    }

    // Server-side preparation of initial values
    const initialUsername = email.split('@')[0]
    const initialEmoji = getRandomAvatarEmoji()
    const initialName = generateRandomName()

    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Logo style={{ fontSize: 'xxx-large' }} />
            
            <div className='w-full max-w-md'>
                <h1 className='text-2xl font-bold text-center mb-8'>Complete Sign Up</h1>
                
                <SignUpForm
                    email={email}
                    secret={secret}
                    initialUsername={initialUsername}
                    initialName={initialName}
                    initialEmoji={initialEmoji}
                    returnTo={returnTo}
                />
            </div>
        </main>
    )
}

function SignUpErrorPage({ 
    title, 
    message, 
    description 
}: {
    title: string
    message: string
    description: string
}) {
    return (
        <main className='flex flex-col items-center justify-center h-screen gap-8 p-16'>
            <Logo style={{ fontSize: 'xxx-large' }} />
            <div className='flex flex-col items-center gap-4 max-w-md text-center'>
                <h1 className='text-2xl font-bold text-alert'>{title}</h1>
                <p className='text-lg'>{message}</p>
                <p className='text-sm text-secondary'>
                    {description}
                </p>
            </div>
            <div className='flex gap-4'>
                <a 
                    href="/auth" 
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors'
                >
                    Request New Link
                </a>
                <a 
                    href="/auth" 
                    className='px-6 py-3 border border-action text-action rounded-lg hover:bg-action hover:text-white transition-colors'
                >
                    Sign In Instead
                </a>
            </div>
        </main>
    )
}