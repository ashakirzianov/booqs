'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const menuIconSize = '2rem' // 32px — matches logo and app bar icon sizes

interface MenuLinkProps {
    href: string
    icon: ReactNode
    children: ReactNode
}

export function MenuLink({ href, icon, children }: MenuLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-lg py-1 rounded-md transition-colors ${isActive
                ? 'text-action bg-background-secondary'
                : 'text-dimmed hover:text-action hover:bg-background-secondary'
                }`}
        >
            <div className="shrink-0 p-0.5" style={{ width: menuIconSize, height: menuIconSize }}>
                {icon}
            </div>
            <span className="hidden large:inline">{children}</span>
        </Link>
    )
}