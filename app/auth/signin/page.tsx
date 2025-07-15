import { redirect } from 'next/navigation'
import { completeSignInAction } from '@/data/auth'
import { Logo } from '@/components/Logo'

export default async function SignInPage({ searchParams }: {
    searchParams: Promise<{
        email?: string,
        secret?: string,
        return_to?: string,
    }>
}) {
    const { email, secret, return_to } = await searchParams
    const returnTo = return_to ?? '/'

    // If missing parameters, show error
    if (!email || !secret) {
        return <SignInErrorPage 
            error="Missing email or secret parameter"
            returnTo={returnTo}
        />
    }

    try {
        const result = await completeSignInAction({ email, secret })

        if (result.success) {
            // Successful sign-in, redirect to return_to
            redirect(returnTo)
        } else {
            // Failed sign-in, show error
            return <SignInErrorPage 
                error={result.reason}
                returnTo={returnTo}
            />
        }
    } catch (err) {
        console.error('Sign-in page error:', err)
        return <SignInErrorPage 
            error="An unexpected error occurred"
            returnTo={returnTo}
        />
    }
}

function SignInErrorPage({ error, returnTo }: {
    error: string,
    returnTo: string,
}) {
    return (
        <main className='flex flex-col items-center justify-center h-screen gap-8 p-16'>
            <Logo style={{
                fontSize: 'xxx-large',
            }} />
            
            <div className='flex flex-col items-center gap-4 max-w-md text-center'>
                <h1 className='text-2xl font-bold text-alert'>Sign-in Failed</h1>
                <p className='text-lg'>{error}</p>
                <p className='text-sm text-secondary'>
                    The sign-in link may have expired or been used already.
                </p>
            </div>

            <div className='flex gap-4'>
                <a 
                    href="/auth" 
                    className='px-6 py-3 bg-action text-white rounded-lg hover:bg-highlight transition-colors'
                >
                    Try Again
                </a>
                <a 
                    href={returnTo} 
                    className='px-6 py-3 border border-action text-action rounded-lg hover:bg-action hover:text-white transition-colors'
                >
                    Continue to App
                </a>
            </div>
        </main>
    )
}