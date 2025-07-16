import { Logo } from '@/components/Logo'

type Params = {
    error: string,
    return_to: string,
}
export async function SignInErrorPage({ searchParams }: {
    searchParams: Promise<Params>
}) {
    const { error, return_to } = await searchParams
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
                    href={return_to}
                    className='px-6 py-3 border border-action text-action rounded-lg hover:bg-action hover:text-white transition-colors'
                >
                    Continue to App
                </a>
            </div>
        </main>
    )
}