import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { feedHref } from '@/common/href'

export default function AuthLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <main className='flex flex-col items-center justify-center min-h-screen gap-8 p-16'>
            <Link href={feedHref()}>
                <Logo size="large" />
            </Link>
            {children}
        </main>
    )
}