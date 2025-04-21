import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'

export default async function Page() {
    return <main className='flex flex-col items-center justify-start h-screen gap-4 p-16'>
        <Logo style={{
            fontSize: 'xxx-large',
        }} />
        <form className='flex flex-col items-center justify-start gap-4 w-full'>
            <h1 className='text-center text-2xl'>Sign in or register</h1>
            <Button>
                <Icon name='new-passkey' />
                <span>Register with Passkey</span>
            </Button>
            <Button>
                <Icon name='signin-passkey' />
                <span>Sign in with Passkey</span>
            </Button>
        </form>
    </main>
}

function Button({ children, onClick, disabled }: {
    children: React.ReactNode,
    onClick?: () => void,
    disabled?: boolean,
}) {
    return <button className='text-action hover:text-highlight flex gap-2 items-center' onClick={onClick} disabled={disabled}>
        {children}
    </button>
}