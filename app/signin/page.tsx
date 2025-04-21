import { Logo } from '@/components/Logo'
import { SignInForm } from './SignInForm'

export default async function Page() {
    return <main className='flex flex-col items-center justify-start h-screen gap-4 p-16'>
        <Logo style={{
            fontSize: 'xxx-large',
        }} />
        <SignInForm returnTo='/' />
    </main>
}