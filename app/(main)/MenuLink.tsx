'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

const menuIconSize = '1.5rem' // 24px — tweak this to resize menu icons

interface MenuLinkProps {
    href: string
    icon: ReactNode
    children: ReactNode
}

export function MenuLink({ href, icon, children }: MenuLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-lg py-1 rounded-md transition-colors ${isActive
                ? 'text-action bg-background-secondary'
                : 'text-dimmed hover:text-action hover:bg-background-secondary'
                }`}
        >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <div style={{ width: menuIconSize, height: menuIconSize }}>{icon}</div>
            </div>
            <span>{children}</span>
        </Link>
    )
}