import { Logo } from '@/components/Logo'

export default function SignUpLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Logo size="large" />
            {children}
        </main>
    )
}