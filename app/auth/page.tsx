import { Logo } from '@/components/Logo'
import { AuthForm } from './AuthForm'

export default async function Page({ searchParams }: {
    searchParams: Promise<{
        [key: string]: string | undefined
    }>,
}) {
    let { return_to } = await searchParams
    return_to = return_to ?? '/'
    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Logo style={{
                fontSize: 'xxx-large',
            }} />
            <AuthForm returnTo={return_to} />
        </main>
    )
}