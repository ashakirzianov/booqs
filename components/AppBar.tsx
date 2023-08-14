import Link from 'next/link'
import { ReactNode } from 'react'
import { feedHref } from './Links'

export function AppBar({ left, right }: {
    left?: ReactNode,
    right?: ReactNode,
}) {
    return <div className="flex flex-row items-center w-screen h-header py-xl px-base sm:py-xl sm:px-lg">
        <div className="mr-xl hidden sm:flex grow-0">
            <Link href={feedHref()}>
                <Logo />
            </Link>
        </div>
        <div className="flex grow">
            {left}
        </div>
        <div className="flex flex-col">
            <div className='flex flex-row grow justify-between items-center gap-4'>
                {right}
            </div>
        </div>
    </div>
}

function Logo() {
    return <div className='font-normal' style={{
        color: 'rgba(253,163,2,1)',
        fontFamily: 'var(--font-main)',
        fontSize: 'x-large',
        background: '-webkit-linear-gradient(180deg, rgba(253,163,2,1) 50%, rgb(200, 145, 2) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        userSelect: 'none',
    }}>
        BOOQS
    </div>
}
