import Link from 'next/link'
import { ReactNode } from 'react'
import { feedHref } from '../application/href'
import { Logo } from './Logo'

export function AppBar({ left, right }: {
    left?: ReactNode,
    right?: ReactNode,
}) {
    return <nav className="flex flex-row items-center w-screen h-header py-xl px-4 gap-4">
        <section className="hidden sm:flex grow-0">
            <Link href={feedHref()}>
                <Logo />
            </Link>
        </section>
        <section className="flex grow">
            {left}
        </section>
        <section className="flex flex-col">
            <div className='flex flex-row grow justify-between items-center gap-4'>
                {right}
            </div>
        </section>
    </nav>
}
