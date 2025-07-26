'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AccountLinkProps {
    href: string
    icon: ReactNode
    children: ReactNode
}

export function AccountLink({ href, icon, children }: AccountLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                    ? 'text-action bg-background-secondary'
                    : 'text-dimmed hover:text-action hover:bg-background-secondary'
            }`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span>{children}</span>
        </Link>
    )
}