import { Logo } from '@/components/Logo'
import { SignInForm } from './SignInForm'

export default async function Page({ searchParams }: {
    searchParams: Promise<{
        [key: string]: string | undefined
    }>,
}) {
    let { return_to } = await searchParams
    return_to = return_to ?? '/'
    return <main className='flex flex-col items-center justify-start h-screen gap-4 p-16'>
        <Logo style={{
            fontSize: 'xxx-large',
        }} />
        <SignInForm returnTo={return_to} />
    </main>
}